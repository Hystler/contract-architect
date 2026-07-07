import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const grantSchema = z.object({
  userId: z.string().trim().min(1, "Укажите пользователя"),
  days: z.union([z.literal(7), z.literal(30), z.literal(90)])
});

export async function POST(request: Request) {
  const { response } = requireAdminSession(request);
  if (response) {
    return response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "База данных не подключена." },
      { status: 503 }
    );
  }

  try {
    const parsed = grantSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте параметры premium-доступа",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + parsed.data.days);

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Пользователь не найден." },
        { status: 404 }
      );
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: parsed.data.userId,
        provider: "MANUAL_ADMIN"
      },
      orderBy: { createdAt: "desc" },
      select: { id: true }
    });

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "ACTIVE",
          plan: "PREMIUM",
          provider: "MANUAL_ADMIN",
          currentPeriodStart: now,
          currentPeriodEnd
        }
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: parsed.data.userId,
          status: "ACTIVE",
          plan: "PREMIUM",
          provider: "MANUAL_ADMIN",
          currentPeriodStart: now,
          currentPeriodEnd
        }
      });
    }

    return NextResponse.json({ message: "Premium-доступ выдан." });
  } catch {
    return NextResponse.json(
      { message: "Не удалось выдать premium-доступ." },
      { status: 500 }
    );
  }
}
