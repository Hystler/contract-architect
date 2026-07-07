import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildContractAssistantPrompt,
  contractAssistantSystemPrompt
} from "@/lib/ai/contractAssistantPrompt";
import { getOpenAIClient, getOpenAIModel } from "@/lib/ai/openai";
import {
  estimateTokens,
  sanitizeContractInput
} from "@/lib/ai/sanitizeContractInput";
import { getAiRuntimeSettings } from "@/lib/ai/settings";
import {
  databaseUnavailableMessage,
  isDatabaseUnavailableError,
  isMigrationError,
  migrationsNotAppliedMessage
} from "@/lib/api/errors";
import { getUserSessionFromRequest } from "@/lib/auth/currentUser";
import { AuthConfigurationError } from "@/lib/auth/session";
import { hasActiveSubscription } from "@/lib/billing/hasActiveSubscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z
  .object({
    action: z.enum([
      "explain",
      "risk_hints",
      "missing_data",
      "questions",
      "rewrite"
    ]),
    contractType: z.string().trim().max(120).optional(),
    selectedText: z.string().trim().max(5000).optional(),
    fullText: z.string().trim().max(12000).optional(),
    userQuestion: z.string().trim().max(1000).optional(),
    personalDataConsent: z
      .boolean()
      .refine((value) => value, {
        message: "Необходимо согласие на обработку персональных данных."
      })
  })
  .superRefine((data, ctx) => {
    if (
      (data.action === "explain" || data.action === "rewrite") &&
      !data.selectedText &&
      !data.fullText
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedText"],
        message: "Добавьте текст пункта для AI-помощника"
      });
    }

    if (
      (data.action === "risk_hints" ||
        data.action === "missing_data" ||
        data.action === "questions") &&
      !data.fullText
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullText"],
        message: "Недостаточно текста документа для анализа"
      });
    }
  });

const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const monthlyBuckets = new Map<string, { totalTokens: number; requestCount: number }>();

export async function POST(request: Request) {
  const clientId = getClientId(request);

  if (isRateLimited(clientId)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Слишком много AI-запросов за короткое время. Подождите несколько минут и повторите попытку."
      },
      { status: 429 }
    );
  }

  try {
    const user = getUserSessionFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Войдите в аккаунт, чтобы использовать AI-помощника."
        },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const parsed = requestSchema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      if (fieldErrors.personalDataConsent?.length) {
        return NextResponse.json(
          {
            success: false,
            error: "Необходимо согласие на обработку персональных данных."
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Проверьте данные для AI-помощника.",
          details: fieldErrors
        },
        { status: 400 }
      );
    }

    const aiSettings = getAiRuntimeSettings();
    if (!aiSettings.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "AI-помощник отключён в настройках сервиса."
        },
        { status: 503 }
      );
    }

    const hasSubscription = await hasActiveSubscription(user.userId);

    if (!hasSubscription) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI-помощник доступен только после оплаты или выдачи premium-доступа."
        },
        { status: 402 }
      );
    }

    const sanitized = sanitizeContractInput(parsed.data);
    const prompt = buildContractAssistantPrompt({
      action: parsed.data.action,
      contractType: parsed.data.contractType,
      selectedText: sanitized.selectedText,
      fullText: sanitized.fullText,
      userQuestion: sanitized.userQuestion
    });
    const estimatedInputTokens = estimateTokens(prompt);
    const monthlyLimit = getMonthlyTokenLimit();
    const usageKey = `${user.userId}:${getCurrentPeriod()}`;

    if (wouldExceedMonthlyLimit(usageKey, estimatedInputTokens, monthlyLimit)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Месячный лимит AI-помощника исчерпан. Дождитесь следующего периода или обновите тариф."
        },
        { status: 429 }
      );
    }

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: aiSettings.model || getOpenAIModel(),
      instructions: contractAssistantSystemPrompt,
      input: prompt,
      max_output_tokens: 900
    });
    const result = response.output_text?.trim();

    if (!result) {
      throw new Error("Empty AI response");
    }

    const inputTokens = response.usage?.input_tokens ?? estimatedInputTokens;
    const outputTokens = response.usage?.output_tokens ?? estimateTokens(result);
    const totalTokens =
      response.usage?.total_tokens ?? inputTokens + outputTokens;

    updateMonthlyUsage(usageKey, totalTokens);
    await recordAggregateUsage(user.userId, {
      inputTokens,
      outputTokens,
      totalTokens
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (isMigrationError(error)) {
      return NextResponse.json(
        { success: false, error: migrationsNotAppliedMessage },
        { status: 500 }
      );
    }

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: databaseUnavailableMessage },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "AI-помощник временно недоступен. Попробуйте позже."
      },
      { status: 503 }
    );
  }
}

function getClientId(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(clientId: string) {
  const limitWindowMs =
    normalizeInteger(process.env.AI_RATE_LIMIT_WINDOW_SECONDS, 300, 30, 3600) *
    1000;
  const maxRequestsPerWindow = normalizeInteger(
    process.env.AI_MAX_REQUESTS_PER_WINDOW,
    8,
    1,
    60
  );
  const now = Date.now();
  const bucket = requestBuckets.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(clientId, {
      count: 1,
      resetAt: now + limitWindowMs
    });
    return false;
  }

  if (bucket.count >= maxRequestsPerWindow) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function getMonthlyTokenLimit() {
  return normalizeInteger(process.env.AI_MONTHLY_TOKEN_LIMIT, 50000, 1000, 500000);
}

function getCurrentPeriod() {
  return new Date().toISOString().slice(0, 7);
}

function wouldExceedMonthlyLimit(
  usageKey: string,
  estimatedInputTokens: number,
  monthlyLimit: number
) {
  const current = monthlyBuckets.get(usageKey);
  return Boolean(current && current.totalTokens + estimatedInputTokens > monthlyLimit);
}

function updateMonthlyUsage(usageKey: string, totalTokens: number) {
  const current = monthlyBuckets.get(usageKey) || {
    totalTokens: 0,
    requestCount: 0
  };

  monthlyBuckets.set(usageKey, {
    totalTokens: current.totalTokens + totalTokens,
    requestCount: current.requestCount + 1
  });
}

async function recordAggregateUsage(
  userId: string | null,
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
) {
  if (!userId || !process.env.DATABASE_URL) {
    return;
  }

  try {
    const { runPrisma } = await import("@/lib/prisma");
    await runPrisma((client) =>
      client.aiUsage.upsert({
        where: {
          userId_period: {
            userId,
            period: getCurrentPeriod()
          }
        },
        update: {
          inputTokens: { increment: usage.inputTokens },
          outputTokens: { increment: usage.outputTokens },
          totalTokens: { increment: usage.totalTokens },
          requestCount: { increment: 1 }
        },
        create: {
          userId,
          period: getCurrentPeriod(),
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          requestCount: 1
        }
      })
    );
  } catch {
    // Не раскрываем и не логируем детали: usage является вспомогательной метрикой.
  }
}

function normalizeInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}
