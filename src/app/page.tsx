import Link from "next/link";
import { Button } from "@/components/ui/Button";

const workflow = [
  {
    title: "Выберите шаблон",
    text: "В MVP доступен пакет: договор оказания услуг и акт выполненных работ."
  },
  {
    title: "Заполните форму",
    text: "Стороны, предмет, работы, суммы и сроки вводятся пользователем вручную."
  },
  {
    title: "Получите файлы",
    text: "Система валидирует данные, формирует два DOCX-файла и ZIP-архив."
  },
  {
    title: "Проверьте через AI",
    text: "AI объясняет пункты и подсказывает, что стоит перепроверить со специалистом."
  }
];

const templates = [
  {
    title: "Договор оказания услуг",
    text: "Фиксирует стороны, предмет работ, сроки, стоимость и порядок оплаты."
  },
  {
    title: "Акт выполненных работ",
    text: "Подтверждает выполнение работ по договору и готовится теми же данными."
  }
];

const aiActions = [
  "Объяснить пункт простым языком",
  "Найти потенциально спорные места",
  "Упростить формулировку без автозамены",
  "Подготовить вопросы к юристу"
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink-950 text-white">
      <section className="relative isolate min-h-[88svh] px-5 pb-16 pt-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
          <Link className="text-sm font-semibold" href="/">
            Contract Architect
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="md" variant="ghost">
              <Link href="/admin">Админка</Link>
            </Button>
            <Button asChild size="md" variant="secondary">
              <Link href="/generator">Создать договор</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74svh] max-w-7xl items-center gap-10 py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.98fr)]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
              Шаблонный генератор документов
            </p>
            <h1 className="mt-5 max-w-[11ch] break-words font-display text-6xl font-semibold leading-[0.96] text-white sm:text-7xl">
              Contract Architect
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-steel-200">
              Генератор договоров и актов по заранее подготовленным DOCX-шаблонам.
              Пользователь сам вводит данные, система проверяет форму и отдаёт
              готовый пакет файлов.
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
              <Button asChild size="lg" variant="ghost">
                <Link href="/preview">Открыть PDF-preview</Link>
              </Button>
            </div>
          </div>

          <div className="w-full">
            <ProductWorkspacePreview />
          </div>
        </div>
      </section>

      <section className="bg-surface-100 px-5 py-16 text-graphite-950 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-500">
              Как работает
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Документ собирается из формы, а не пишется AI с нуля
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-500">
              Это сохраняет предсказуемость MVP: шаблон остаётся источником
              юридического текста, а AI работает отдельным объясняющим слоем.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map((item, index) => (
              <article
                className="rounded-lg border border-legal-border bg-paper-50 p-5 shadow-paper"
                key={item.title}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/35 bg-gold-500/10 text-sm font-semibold">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-500">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-50 px-5 py-16 text-graphite-950 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="rounded-lg border border-legal-border bg-white p-5 shadow-paper">
            <div className="border-b border-legal-border pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
                Превью продукта
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                Рабочая поверхность договора
              </h2>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
              <DocumentSheet />
              <AiMiniPanel />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-intelligence-500">
              AI-помощник
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              AI рядом с документом, а не вместо документа
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-500">
              Помощник показывает объяснения, подсказки по вниманию и варианты
              более понятной формулировки. Он не применяет правки автоматически.
            </p>
            <ul className="mt-6 space-y-3">
              {aiActions.map((action) => (
                <li
                  className="rounded-md border border-legal-border bg-surface-100 px-4 py-3 text-sm font-medium"
                  key={action}
                >
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface-100 px-5 py-16 text-graphite-950 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-500">
              Шаблоны MVP
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Один ввод данных — два документа на выходе
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <article
                className="rounded-lg border border-legal-border bg-paper-50 p-6 shadow-paper"
                key={template.title}
              >
                <h3 className="text-xl font-semibold">{template.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-500">
                  {template.text}
                </p>
                <Button asChild className="mt-6" variant="secondary">
                  <Link href="/generator">Использовать шаблон</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
              Ограничения
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Прозрачный MVP без обещаний юридической силы
            </h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-base leading-8 text-steel-200">
            Сервис не заменяет юриста, не гарантирует отсутствие рисков и не
            генерирует договоры с нуля. Он помогает аккуратно заполнить
            подготовленные шаблоны и получить пакет документов для дальнейшей
            проверки.
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-ink-950 px-5 py-8 text-sm text-steel-300 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Contract Architect</p>
          <p>Шаблоны DOCX, экспорт ZIP, HTML-preview для печати в PDF.</p>
        </div>
      </footer>
    </main>
  );
}

function ProductWorkspacePreview() {
  return (
    <div className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-md bg-paper-50 p-6 text-graphite-950 shadow-paper">
          <DocumentSheet />
        </div>
        <AiMiniPanel />
      </div>
    </div>
  );
}

function DocumentSheet() {
  return (
    <div className="rounded-md border border-legal-border bg-paper-50 p-5 text-graphite-950">
      <div className="flex items-start justify-between gap-4 border-b border-legal-border pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-500">
            DOCX-шаблон
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold">
            Договор № 1
          </h3>
        </div>
        <span className="rounded-md border border-gold-500/35 px-3 py-2 text-xs font-semibold">
          DOCX + ZIP
        </span>
      </div>
      <div className="mt-5 space-y-3 text-sm leading-6">
        <p>
          Исполнитель обязуется выполнить работы по предмету договора, а
          Заказчик обязуется принять результат и оплатить его.
        </p>
        <div className="rounded-md border border-intelligence-500/30 bg-intelligence-100 p-3">
          Потенциально стоит уточнить сроки передачи результата и порядок
          финальной оплаты.
        </div>
        <p>
          Общая стоимость работ, размер предоплаты и остаток оплаты
          рассчитываются на основании данных формы.
        </p>
      </div>
    </div>
  );
}

function AiMiniPanel() {
  return (
    <div className="rounded-md border border-intelligence-400/25 bg-graphite-900 p-4 text-white shadow-ai">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
        AI-помощник
      </p>
      <h3 className="mt-3 text-lg font-semibold">Подсказки по вниманию</h3>
      <div className="mt-4 space-y-3 text-sm leading-6 text-steel-200">
        <p>Средний уровень: уточните, что считается завершением работы.</p>
        <p>Низкий уровень: проверьте реквизиты сторон перед подписанием.</p>
      </div>
      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.05] p-3 text-xs leading-5 text-steel-300">
        Не является юридической консультацией.
      </div>
    </div>
  );
}
