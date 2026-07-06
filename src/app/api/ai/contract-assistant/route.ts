import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AiProviderError,
  runContractAssistant
} from "@/lib/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z
  .object({
    action: z.enum(["explain", "risk_hints", "rewrite", "questions"]),
    contractType: z.string().trim().max(120).optional(),
    selectedText: z.string().trim().max(4000).optional(),
    fullText: z.string().trim().max(12000).optional(),
    userQuestion: z.string().trim().max(1000).optional()
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
      (data.action === "risk_hints" || data.action === "questions") &&
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
const limitWindowMs = 5 * 60 * 1000;
const maxRequestsPerWindow = 8;

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
    const payload = await request.json();
    const parsed = requestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Проверьте текст и выбранное действие AI-помощника.",
          details: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const result = await runContractAssistant(parsed.data);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof AiProviderError
            ? error.message
            : "AI-помощник временно недоступен. Повторите запрос позже."
      },
      { status: error instanceof AiProviderError ? 503 : 500 }
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
