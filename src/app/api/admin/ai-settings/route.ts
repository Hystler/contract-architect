import { NextResponse } from "next/server";
import { z } from "zod";
import {
  canWriteWithoutToken,
  getPublicAiRuntimeStatus,
  updateAiRuntimeSettings
} from "@/lib/ai/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  enabled: z.boolean(),
  provider: z.literal("openai"),
  model: z.string().trim().min(1, "Укажите модель").max(80),
  maxRequestsPerWindow: z.coerce
    .number()
    .int()
    .min(1, "Минимум 1 запрос")
    .max(60, "Максимум 60 запросов"),
  rateLimitWindowSeconds: z.coerce
    .number()
    .int()
    .min(30, "Минимум 30 секунд")
    .max(3600, "Максимум 3600 секунд"),
  customInstruction: z.string().trim().max(1200, "Инструкция слишком длинная")
});

export async function GET() {
  return NextResponse.json(getPublicAiRuntimeStatus(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  if (!canWriteSettings(request)) {
    return NextResponse.json(
      {
        message:
          "Нет доступа к настройкам. Укажите корректный ADMIN_ACCESS_TOKEN."
      },
      { status: 403 }
    );
  }

  try {
    const payload = await request.json();
    const parsed = settingsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте настройки AI",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const settings = updateAiRuntimeSettings(parsed.data);
    return NextResponse.json({
      message: "Настройки AI сохранены.",
      settings
    });
  } catch {
    return NextResponse.json(
      { message: "Не удалось сохранить настройки AI." },
      { status: 500 }
    );
  }
}

function canWriteSettings(request: Request) {
  const adminToken = process.env.ADMIN_ACCESS_TOKEN;

  if (!adminToken) {
    return canWriteWithoutToken();
  }

  const token =
    request.headers.get("x-admin-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return token === adminToken;
}
