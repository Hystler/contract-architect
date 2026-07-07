import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LegalFooter } from "@/components/legal/LegalPage";
import { Button } from "@/components/ui/Button";

const features = [
  "Генерация договора и акта из DOCX-шаблонов",
  "Скачивание DOCX и ZIP-архива",
  "PDF-preview через печать браузера",
  "AI-проверки документов",
  "Лимит AI-запросов",
  "Будущая история документов"
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SiteHeader />

        <section className="grid gap-8 py-14 lg:grid-cols-[0.82fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
              Подписка
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight sm:text-6xl">
              Доступ к AI-помощнику
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-steel-300">
              Основная генерация документов остаётся шаблонной. AI-помощник
              подключается как платный слой проверки, объяснений и подсказок по
              заполненности.
            </p>
          </div>

          <article className="rounded-lg border border-legal-border bg-paper-50 p-6 text-graphite-950 shadow-paper">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-500">
              Тариф
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Старт</h2>
            <p className="mt-3 text-3xl font-semibold">Цена будет указана позже</p>
            <p className="mt-3 text-sm leading-6 text-muted-500">
              Оплата будет подключена позже. Сейчас страница готовит продуктовую
              структуру для подписочной модели.
            </p>
            <ul className="mt-6 space-y-3">
              {features.map((feature) => (
                <li
                  className="rounded-md border border-legal-border bg-white px-4 py-3 text-sm font-medium"
                  key={feature}
                >
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full" size="lg">
              <Link href="/generator">Вернуться к генератору</Link>
            </Button>
          </article>
        </section>

        <LegalFooter />
      </div>
    </main>
  );
}
