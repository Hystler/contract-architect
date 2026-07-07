import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  AuthConfigurationError,
  createAdminSession,
  getSessionCookieOptions,
  safeEqual,
  adminSessionMaxAge
} from "@/lib/auth/session";
import { jsonError } from "@/lib/api/errors";

export const runtime = "nodejs";

const adminLoginSchema = z.object({
  login: z.string().trim().min(1, "Укажите login"),
  password: z.string().min(1, "Укажите пароль")
});

export async function POST(request: Request) {
  const adminLogin = process.env.ADMIN_LOGIN?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminLogin || !adminPassword) {
    return jsonError("ADMIN_LOGIN или ADMIN_PASSWORD не заданы.", 503);
  }

  try {
    const payload = await request.json();
    const parsed = adminLoginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте данные входа",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    if (
      !safeEqual(parsed.data.login, adminLogin) ||
      !safeEqual(parsed.data.password, adminPassword)
    ) {
      return NextResponse.json(
        { message: "Неверный login или пароль администратора." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ message: "Вход выполнен." });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSession(adminLogin),
      getSessionCookieOptions(adminSessionMaxAge)
    );

    return response;
  } catch (error) {
    const message =
      error instanceof AuthConfigurationError
        ? error.message
        : "Не удалось выполнить вход в админку.";

    return jsonError(message, 500);
  }
}
