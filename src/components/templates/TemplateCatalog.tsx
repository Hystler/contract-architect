"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { TemplateSummary } from "@/lib/templates/templateCatalog";

export function TemplateCatalog() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTemplates() {
      try {
        const response = await fetch("/api/templates", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Не удалось загрузить каталог");
        }

        const data = (await response.json()) as { templates?: TemplateSummary[] };

        if (isMounted) {
          setTemplates(data.templates || []);
        }
      } catch {
        if (isMounted) {
          setError("Каталог временно недоступен.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => ["Все", ...Array.from(new Set(templates.map((template) => template.category)))],
    [templates]
  );
  const visibleTemplates =
    activeCategory === "Все"
      ? templates
      : templates.filter((template) => template.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition ${
              activeCategory === category
                ? "border-gold-500/45 bg-gold-500/10 text-white"
                : "border-white/10 bg-white/[0.04] text-steel-300 hover:text-white"
            }`}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-steel-300">
          Загружаем шаблоны...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-steel-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && visibleTemplates.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-steel-300">
          Шаблоны не найдены.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTemplates.map((template) => (
          <article
            className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-soft"
            key={template.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">
                  {template.category}
                </p>
                <h2 className="mt-3 text-xl font-semibold">{template.name}</h2>
              </div>
              <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-xs font-semibold text-steel-200">
                {template.isPremium ? "Premium" : "Бесплатно"}
              </span>
            </div>

            <p className="mt-4 min-h-20 text-sm leading-6 text-steel-300">
              {template.description || "Технический шаблон для генерации документа."}
            </p>
            <p className="mt-4 rounded-md border border-gold-300/20 bg-gold-300/10 p-3 text-xs leading-5 text-gold-100">
              Шаблон требует юридической проверки перед использованием.
            </p>

            <Button asChild className="mt-5 w-full" variant="secondary">
              <Link href={`/generator?templateId=${template.id}`}>
                Использовать шаблон
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
