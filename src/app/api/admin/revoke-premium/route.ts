import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const revokeSchema = z.object({
  userId: z.string().trim().min(1, "Укажите пользователя")
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
    const parsed = revokeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте параметры отключения",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    await prisma.subscription.updateMany({
      where: {
        userId: parsed.data.userId,
        status: "ACTIVE"
      },
      data: {
        status: "CANCELED",
        currentPeriodEnd: new Date()
      }
    });

    return NextResponse.json({ message: "Premium-доступ отключён." });
  } catch {
    return NextResponse.json(
      { message: "Не удалось отключить premium-доступ." },
      { status: 500 }
    );
  }
}
