"use client";

import { useEffect, useState } from "react";

type TemplateItem = {
  id: string;
  type: string;
  name: string;
  filePath: string;
  isActive: boolean;
};

export function TemplateSelector() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
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

        const data = (await response.json()) as { templates?: TemplateItem[] };

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

  const activeNames = templates.map((template) => template.name).join(" + ");

  return (
    <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
        Шаблон
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Договор оказания услуг + акт выполненных работ
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-500">
            MVP формирует пакет из двух DOCX-файлов на основе заранее
            подготовленных шаблонов.
          </p>
        </div>
        <div className="rounded-md border border-gold-500/35 bg-gold-500/10 px-3 py-2 text-sm font-semibold text-graphite-950">
          Выбран
        </div>
      </div>

      <div className="mt-4 rounded-md border border-legal-border bg-surface-100 p-3 text-sm leading-6 text-graphite-950">
        {isLoading ? "Загрузка доступных шаблонов..." : null}
        {!isLoading && error ? error : null}
        {!isLoading && !error && templates.length === 0
          ? "Список шаблонов пуст. Используется базовый fallback-пакет."
          : null}
        {!isLoading && !error && templates.length > 0
          ? `Доступно: ${activeNames}`
          : null}
      </div>
    </section>
  );
}
