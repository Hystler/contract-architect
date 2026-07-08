import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TemplateUploadForm } from "@/components/templates/TemplateUploadForm";
import { Button } from "@/components/ui/Button";
import { getCurrentUserSession } from "@/lib/auth/currentUser";
import { hasActiveSubscription } from "@/lib/billing/hasActiveSubscription";

export const dynamic = "force-dynamic";

export default async function TemplateUploadPage() {
  const user = getCurrentUserSession();

  if (!user) {
    redirect("/login");
  }

  let premiumActive = false;

  try {
    premiumActive = await hasActiveSubscription(user.userId);
  } catch {
    premiumActive = false;
  }

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SiteHeader
          ctaHref="/templates"
          ctaLabel="Каталог"
          subtitle="Загрузка DOCX-шаблонов доступна premium-пользователям"
        />

        <section className="py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
            Premium-функция
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Загрузка своего DOCX-шаблона
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-steel-300">
            AI анализирует структуру договора, ищет переменные и предлагает
            поля формы. Он не пишет договор с нуля и не даёт юридическое
            заключение.
          </p>
        </section>

        {premiumActive ? (
          <TemplateUploadForm />
        ) : (
          <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white shadow-soft">
            <h2 className="text-2xl font-semibold">Нужен premium-доступ</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-300">
              Загрузка своих шаблонов доступна только с premium-доступом.
              Базовая генерация DOCX/ZIP и PDF-preview остаётся доступной в
              генераторе.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href="/pricing">Оформить доступ</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/generator">Вернуться в генератор</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
