import { ContractForm } from "@/components/generator/ContractForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getCurrentUserSession } from "@/lib/auth/currentUser";
import { hasActiveSubscription } from "@/lib/billing/hasActiveSubscription";

export const dynamic = "force-dynamic";

export default async function GeneratorPage() {
  const user = getCurrentUserSession();
  const premiumActive = user
    ? await hasActiveSubscription(user.userId)
    : false;

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <SiteHeader
          ctaHref="/pricing"
          ctaLabel="Premium"
          subtitle="Шаблоны DOCX, экспорт ZIP, AI-проверка для premium"
        />

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
            Конструктор документов
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Создайте договор и акт из шаблона
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-steel-300">
            Заполните одну форму, проверьте структуру через AI-помощника и
            экспортируйте DOCX-пакет. AI не заменяет специалиста и не меняет
            документ автоматически.
          </p>
        </div>
        <ContractForm
          authState={{
            email: user?.email,
            hasActiveSubscription: premiumActive,
            isAuthenticated: Boolean(user)
          }}
        />
      </div>
    </main>
  );
}
