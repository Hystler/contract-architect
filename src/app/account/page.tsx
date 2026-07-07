import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import {
  databaseUnavailableMessage,
  isDatabaseUnavailableError,
  isMigrationError,
  migrationsNotAppliedMessage
} from "@/lib/api/errors";
import { getCurrentUserSession } from "@/lib/auth/currentUser";
import { getActiveSubscription } from "@/lib/billing/hasActiveSubscription";
import { runPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = getCurrentUserSession();

  if (!session) {
    redirect("/login");
  }

  let accountError = "";
  let user:
    | {
        id: string;
        email: string;
        createdAt: Date;
      }
    | null = null;
  let activeSubscription: Awaited<ReturnType<typeof getActiveSubscription>> =
    null;
  let usage: { requestCount: number; totalTokens: number } | null = null;

  if (process.env.DATABASE_URL) {
    try {
      user = await runPrisma((client) =>
        client.user.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        })
      );
      activeSubscription = await getActiveSubscription(session.userId);
      usage = await runPrisma((client) =>
        client.aiUsage.findUnique({
          where: {
            userId_period: {
              userId: session.userId,
              period: getCurrentPeriod()
            }
          },
          select: { requestCount: true, totalTokens: true }
        })
      );
    } catch (error) {
      accountError = isMigrationError(error)
        ? migrationsNotAppliedMessage
        : isDatabaseUnavailableError(error)
          ? databaseUnavailableMessage
          : "Не удалось загрузить данные аккаунта.";
    }
  }

  if (process.env.DATABASE_URL && !accountError && !user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold" href="/">
            Contract Architect
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="ghost">
              <Link href="/generator">Генератор</Link>
            </Button>
            <LogoutButton />
          </div>
        </header>

        <section className="mt-8 rounded-lg border border-legal-border bg-paper-50 p-6 text-graphite-950 shadow-paper sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-500">
            Аккаунт
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            {user?.email || session.email}
          </h1>

          {accountError ? (
            <div className="mt-6 rounded-md border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-800">
              {accountError}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Статус доступа"
              value={
                activeSubscription ? "Premium активен" : "Premium не активен"
              }
            />
            <InfoCard
              label="Окончание доступа"
              value={
                activeSubscription?.currentPeriodEnd
                  ? formatDate(activeSubscription.currentPeriodEnd)
                  : "Не указано"
              }
            />
            <InfoCard
              label="AI-запросов за период"
              value={`${usage?.requestCount ?? 0}`}
            />
            <InfoCard
              label="Токенов за период"
              value={`${usage?.totalTokens ?? 0}`}
            />
          </div>

          {!activeSubscription ? (
            <div className="mt-6 rounded-md border border-gold-500/35 bg-gold-500/10 p-4 text-sm leading-6">
              AI-помощник доступен только с premium-доступом. Для теста его
              можно выдать вручную через скрытую админку.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-legal-border bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getCurrentPeriod() {
  return new Date().toISOString().slice(0, 7);
}
