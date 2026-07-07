import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDatabaseErrorResponse, jsonError } from "@/lib/api/errors";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { runPrisma } from "@/lib/prisma";

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
    return jsonError("База данных не подключена", 503);
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

    const user = await runPrisma((client) =>
      client.user.findUnique({
        where: { id: parsed.data.userId },
        select: { id: true }
      })
    );

    if (!user) {
      return NextResponse.json(
        { message: "Пользователь не найден." },
        { status: 404 }
      );
    }

    const existingSubscription = await runPrisma((client) =>
      client.subscription.findFirst({
        where: {
          userId: parsed.data.userId,
          provider: "MANUAL_ADMIN"
        },
        orderBy: { createdAt: "desc" },
        select: { id: true }
      })
    );

    if (existingSubscription) {
      await runPrisma((client) =>
        client.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "ACTIVE",
            plan: "PREMIUM",
            provider: "MANUAL_ADMIN",
            currentPeriodStart: now,
            currentPeriodEnd
          }
        })
      );
    } else {
      await runPrisma((client) =>
        client.subscription.create({
          data: {
            userId: parsed.data.userId,
            status: "ACTIVE",
            plan: "PREMIUM",
            provider: "MANUAL_ADMIN",
            currentPeriodStart: now,
            currentPeriodEnd
          }
        })
      );
    }

    return NextResponse.json({ message: "Premium-доступ выдан." });
  } catch (error) {
    return adminDatabaseErrorResponse(
      error,
      "Не удалось выдать premium-доступ."
    );
  }
}
