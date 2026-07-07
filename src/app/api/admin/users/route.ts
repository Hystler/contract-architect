import { NextResponse } from "next/server";
import { adminDatabaseErrorResponse, jsonError } from "@/lib/api/errors";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { runPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = requireAdminSession(request);
  if (response) {
    return response;
  }

  if (!process.env.DATABASE_URL) {
    return jsonError("База данных не подключена", 503);
  }

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim();
    const period = getCurrentPeriod();

    const users = await runPrisma((client) =>
      client.user.findMany({
        where: query
          ? {
              email: {
                contains: query,
                mode: "insensitive"
              }
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      })
    );
    const userIds = users.map((user) => user.id);
    const subscriptions = userIds.length
      ? await runPrisma((client) =>
          client.subscription.findMany({
            where: { userId: { in: userIds } },
            orderBy: { currentPeriodEnd: "desc" },
            select: {
              userId: true,
              status: true,
              plan: true,
              currentPeriodEnd: true,
              provider: true
            }
          })
        )
      : [];
    const usageRows = userIds.length
      ? await runPrisma((client) =>
          client.aiUsage.findMany({
            where: { userId: { in: userIds }, period },
            select: {
              userId: true,
              requestCount: true,
              totalTokens: true
            }
          })
        )
      : [];
    const subscriptionByUserId = new Map<
      string,
      (typeof subscriptions)[number]
    >();
    subscriptions.forEach((subscription) => {
      if (!subscriptionByUserId.has(subscription.userId)) {
        subscriptionByUserId.set(subscription.userId, subscription);
      }
    });
    const usageByUserId = new Map(
      usageRows.map((usage) => [usage.userId, usage])
    );

    return NextResponse.json({
      users: users.map((user) => {
        const subscription = subscriptionByUserId.get(user.id) || null;
        const usage = usageByUserId.get(user.id) || null;
        const premiumActive = Boolean(
          subscription?.status === "ACTIVE" &&
            subscription.currentPeriodEnd &&
            subscription.currentPeriodEnd > new Date()
        );

        return {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          premiumActive,
          premiumStatus: subscription?.status || null,
          premiumPlan: subscription?.plan || null,
          premiumProvider: subscription?.provider || null,
          premiumEndsAt: subscription?.currentPeriodEnd || null,
          aiRequestCount: usage?.requestCount || 0,
          aiTotalTokens: usage?.totalTokens || 0
        };
      })
    });
  } catch (error) {
    return adminDatabaseErrorResponse(
      error,
      "Не удалось загрузить пользователей."
    );
  }
}

function getCurrentPeriod() {
  return new Date().toISOString().slice(0, 7);
}
