"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TemplateSummary } from "@/lib/templates/templateCatalog";

type TemplateSelectorProps = {
  hasActiveSubscription: boolean;
  onSelect: (template: TemplateSummary) => void;
  value?: string;
};

export function TemplateSelector({
  hasActiveSubscription,
  onSelect,
  value
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTemplates() {
      try {
        const response = await fetch("/api/templates", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить шаблоны");
        }

        const data = (await response.json()) as { templates?: TemplateSummary[] };

        if (isMounted) {
          setTemplates(data.templates || []);
        }
      } catch {
        if (isMounted) {
          setError("Шаблоны временно недоступны. Используется базовый пакет документов.");
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

  useEffect(() => {
    const selected = templates.find((template) => template.id === value);

    if (selected) {
      onSelect(selected);
    }
  }, [onSelect, templates, value]);

  const categories = useMemo(
    () => ["Все", ...Array.from(new Set(templates.map((template) => template.category)))],
    [templates]
  );

  const visibleTemplates = useMemo(
    () =>
      activeCategory === "Все"
        ? templates
        : templates.filter((template) => template.category === activeCategory),
    [activeCategory, templates]
  );

  return (
    <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
            Шаг 1
          </p>
          <h2 className="mt-2 text-xl font-semibold">Выберите шаблон</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-500">
            Каталог содержит технические шаблоны для MVP. Каждый документ
            требует проверки специалистом перед использованием.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold-500/35 bg-gold-500/10 px-4 text-sm font-semibold text-graphite-950 transition hover:bg-gold-500/20"
          href="/templates/upload"
        >
          Загрузить свой шаблон
        </Link>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition ${
              activeCategory === category
                ? "border-gold-500/45 bg-gold-500/10 text-graphite-950"
                : "border-legal-border bg-white text-muted-500 hover:text-graphite-950"
            }`}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
        {isLoading ? (
          <div className="rounded-md border border-legal-border bg-surface-100 p-4 text-sm text-muted-500">
            Загружаем каталог шаблонов...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-md border border-legal-border bg-surface-100 p-4 text-sm text-muted-500">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && visibleTemplates.length === 0 ? (
          <div className="rounded-md border border-legal-border bg-surface-100 p-4 text-sm text-muted-500">
            В этой категории пока нет активных шаблонов.
          </div>
        ) : null}

        {visibleTemplates.map((template) => {
          const isSelected = value === template.id;
          const isLocked = template.isPremium && !hasActiveSubscription;

          return (
            <article
              className={`rounded-lg border p-4 transition ${
                isSelected
                  ? "border-gold-500/55 bg-gold-500/10"
                  : "border-legal-border bg-white hover:border-gold-500/35"
              }`}
              key={template.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-500">
                    {template.category}
                  </p>
                  <h3 className="mt-2 text-base font-semibold">{template.name}</h3>
                </div>
                <span
                  className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${
                    template.isPremium
                      ? "border-blue-300/35 bg-blue-300/10 text-blue-900"
                      : "border-gold-500/35 bg-gold-500/10 text-graphite-950"
                  }`}
                >
                  {template.isPremium ? "Premium" : "Бесплатно"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-500">
                {template.description || "Технический шаблон для генерации документа."}
              </p>
              <p className="mt-3 rounded-md border border-legal-border bg-surface-100 p-3 text-xs leading-5 text-muted-500">
                Требует проверки специалистом.
              </p>
              <button
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-graphite-950 px-4 text-sm font-semibold text-white transition hover:bg-graphite-800 disabled:cursor-not-allowed disabled:bg-muted-500"
                disabled={isLocked}
                onClick={() => onSelect(template)}
                type="button"
              >
                {isSelected
                  ? "Выбран"
                  : isLocked
                    ? "Доступно в premium"
                    : "Использовать шаблон"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
