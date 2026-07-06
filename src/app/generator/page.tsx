import { ContractForm } from "@/components/generator/ContractForm";
import Link from "next/link";

export default function GeneratorPage() {
  return (
    <main className="min-h-screen bg-ink-950 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-7 flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold text-white" href="/">
            Contract Architect
          </Link>
          <div className="flex flex-wrap gap-2 text-xs text-steel-300">
            <span className="rounded-full border border-white/10 px-3 py-1">
              Шаблоны DOCX
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              Экспорт ZIP
            </span>
            <span className="rounded-full border border-blue-300/25 px-3 py-1 text-blue-100">
              AI-подсказки
            </span>
          </div>
        </header>

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
        <ContractForm />
      </div>
    </main>
  );
}
