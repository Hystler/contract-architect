import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const principles = [
  "Вы вводите данные сторон, сроки, суммы и перечень работ.",
  "Система проверяет форму и подставляет значения в DOCX-шаблоны.",
  "На выходе получается ZIP-архив с договором и актом выполненных работ."
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-matte-950">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.82fr] lg:px-10">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-brass-300">
            Шаблонный генератор документов
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Генератор договоров и актов по готовым шаблонам
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-steel-200">
            Пользователь сам вводит данные, а система валидирует форму,
            подставляет значения в заранее подготовленные DOCX-шаблоны и
            формирует пакет документов.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-steel-300">
            Документы формируются на основе заранее подготовленных шаблонов.
            Перед использованием в юридически значимых ситуациях проверьте
            документ со специалистом.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/generator">Создать документ</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/preview">Открыть PDF-preview</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Card className="p-5 shadow-soft sm:p-6">
            <div className="rounded-md border border-white/10 bg-[#f7f5ef] p-6 text-[#151515] shadow-2xl">
              <div className="mb-7 flex items-start justify-between gap-6 border-b border-black/15 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-black/50">
                    Пакет документов
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Договор и акт
                  </h2>
                </div>
                <div className="rounded-sm border border-black/20 px-3 py-2 text-sm">
                  DOCX + ZIP
                </div>
              </div>

              <div className="space-y-4 text-sm leading-6">
                {principles.map((item, index) => (
                  <div className="grid grid-cols-[2rem_1fr] gap-3" key={item}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-xs font-semibold">
                      {index + 1}
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-black/60">
                <div className="rounded-sm border border-black/10 p-3">
                  Проверка обязательных полей
                </div>
                <div className="rounded-sm border border-black/10 p-3">
                  Печатная HTML-версия
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
