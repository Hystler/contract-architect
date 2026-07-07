"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GeneratorError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-ink-950 px-5 py-10 text-white">
      <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
          Генератор
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          Что-то пошло не так
        </h1>
        <p className="mt-4 text-sm leading-6 text-steel-300">
          Попробуйте обновить страницу или вернуться в генератор.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="secondary">
            Обновить страницу
          </Button>
          <Button asChild>
            <Link href="/generator">Вернуться в генератор</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
