import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPublicAiRuntimeStatus,
  updateAiRuntimeSettings
} from "@/lib/ai/settings";
import { requireAdminSession } from "@/lib/auth/adminGuard";

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

export async function GET(request: Request) {
  const { response } = requireAdminSession(request);
  if (response) {
    return response;
  }

  return NextResponse.json(getPublicAiRuntimeStatus(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  const { response } = requireAdminSession(request);
  if (response) {
    return response;
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
