import "server-only";
import { runPrisma } from "@/lib/prisma";

export async function hasActiveSubscription(userId?: string | null) {
  if (!userId || !process.env.DATABASE_URL) {
    return false;
  }

  const subscription = await getActiveSubscription(userId);
  return Boolean(subscription);
}

export async function getActiveSubscription(userId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  return runPrisma((client) =>
    client.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        currentPeriodEnd: {
          gt: new Date()
        }
      },
      orderBy: {
        currentPeriodEnd: "desc"
      },
      select: {
        id: true,
        plan: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        provider: true
      }
    })
  );
}
