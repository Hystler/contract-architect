import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import {
  AuthConfigurationError,
  USER_SESSION_COOKIE,
  createUserSession,
  getSessionCookieOptions,
  userSessionMaxAge
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z
  .object({
    email: z.string().trim().email("Укажите корректный email").max(255),
    password: z
      .string()
      .min(8, "Пароль должен быть не короче 8 символов")
      .max(120, "Пароль слишком длинный"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают"
  });

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "База данных не подключена. Регистрация недоступна." },
      { status: 503 }
    );
  }

  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте данные регистрации",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже зарегистрирован." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      },
      select: {
        id: true,
        email: true
      }
    });

    const response = NextResponse.json({ user });
    response.cookies.set(
      USER_SESSION_COOKIE,
      createUserSession(user),
      getSessionCookieOptions(userSessionMaxAge)
    );

    return response;
  } catch (error) {
    const message =
      error instanceof AuthConfigurationError
        ? error.message
        : "Не удалось зарегистрировать пользователя.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
