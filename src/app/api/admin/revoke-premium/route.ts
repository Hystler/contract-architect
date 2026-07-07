import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDatabaseErrorResponse, jsonError } from "@/lib/api/errors";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { runPrisma } from "@/lib/prisma";

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
    return jsonError("База данных не подключена", 503);
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

    await runPrisma((client) =>
      client.subscription.updateMany({
        where: {
          userId: parsed.data.userId,
          status: "ACTIVE"
        },
        data: {
          status: "CANCELED",
          currentPeriodEnd: new Date()
        }
      })
    );

    return NextResponse.json({ message: "Premium-доступ отключён." });
  } catch (error) {
    return adminDatabaseErrorResponse(
      error,
      "Не удалось отключить premium-доступ."
    );
  }
}
