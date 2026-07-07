import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import {
  AuthConfigurationError,
  USER_SESSION_COOKIE,
  createUserSession,
  getSessionCookieOptions,
  userSessionMaxAge
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email("Укажите корректный email").max(255),
  password: z.string().min(1, "Укажите пароль").max(120, "Пароль слишком длинный")
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "База данных не подключена. Вход недоступен." },
      { status: 503 }
    );
  }

  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте email и пароль",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true
      }
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { message: "Неверный email или пароль." },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Неверный email или пароль." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      email: user.email
    };
    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(
      USER_SESSION_COOKIE,
      createUserSession(safeUser),
      getSessionCookieOptions(userSessionMaxAge)
    );

    return response;
  } catch (error) {
    const message =
      error instanceof AuthConfigurationError
        ? error.message
        : "Не удалось выполнить вход.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
