import Link from "next/link";
import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { Button } from "@/components/ui/Button";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-ink-950 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-semibold text-white" href="/">
              Contract Architect
            </Link>
            <p className="mt-2 text-sm text-steel-300">
              Админка настроек MVP
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="ghost">
              <Link href="/">Главная</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/generator">Открыть генератор</Link>
            </Button>
          </div>
        </header>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
            Администрирование
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Настройки AI и продукта
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-steel-300">
            Здесь можно включить или отключить AI-помощника, выбрать модель,
            настроить лимиты и добавить внутреннюю инструкцию. Секретные ключи
            задаются только через env.
          </p>
        </div>

        <AiSettingsForm />
      </div>
    </main>
  );
}
