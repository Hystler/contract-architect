import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const period = getCurrentPeriod();

  const users = await prisma.user.findMany({
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
      createdAt: true,
      subscriptions: {
        orderBy: { currentPeriodEnd: "desc" },
        take: 1,
        select: {
          status: true,
          plan: true,
          currentPeriodEnd: true,
          provider: true
        }
      },
      aiUsage: {
        where: { period },
        take: 1,
        select: {
          requestCount: true,
          totalTokens: true
        }
      }
    }
  });

  return NextResponse.json({
    users: users.map((user) => {
      const subscription = user.subscriptions[0] || null;
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
        aiRequestCount: user.aiUsage[0]?.requestCount || 0,
        aiTotalTokens: user.aiUsage[0]?.totalTokens || 0
      };
    })
  });
}

function getCurrentPeriod() {
  return new Date().toISOString().slice(0, 7);
}
