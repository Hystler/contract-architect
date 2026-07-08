import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TemplateCatalog } from "@/components/templates/TemplateCatalog";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-ink-950 px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SiteHeader
          ctaHref="/generator"
          ctaLabel="Создать документ"
          subtitle="Каталог DOCX-шаблонов и premium-загрузка"
        />

        <section className="py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
                Каталог шаблонов
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Выберите тип документа
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-steel-300">
                В каталоге используются технические шаблоны для генерации.
                Документы не заменяют юриста и требуют проверки специалистом.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/templates/upload">Загрузить свой шаблон</Link>
            </Button>
          </div>
        </section>

        <TemplateCatalog />
      </div>
    </main>
  );
}
