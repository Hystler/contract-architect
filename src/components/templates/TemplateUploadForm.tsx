"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  templateCategories,
} from "@/lib/templates/templateCatalog";
import type { TemplateAnalysis } from "@/lib/templates/analyzeTemplateWithAI";

type AnalyzeResponse = {
  analysis?: TemplateAnalysis;
  error?: string;
  template?: {
    id: string;
  };
};

export function TemplateUploadForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/templates/analyze", {
        method: "POST",
        body: new FormData(event.currentTarget)
      });
      const data = (await response.json().catch(() => null)) as AnalyzeResponse | null;

      if (!response.ok || !data) {
        throw new Error(data?.error || "Не удалось проанализировать шаблон.");
      }

      setResult(data);
      setMessage("Шаблон сохранён и проанализирован.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось проанализировать шаблон."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)]">
      <form
        className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper"
        onSubmit={submitUpload}
      >
        <h2 className="text-xl font-semibold">Новый DOCX-шаблон</h2>
        <p className="mt-2 text-sm leading-6 text-muted-500">
          AI анализирует структуру и переменные, но не переписывает договор и
          не подтверждает юридическую силу документа.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Название шаблона
            </span>
            <Input name="name" placeholder="Например, договор аренды офиса" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Категория
            </span>
            <Select name="category" required>
              {templateCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Описание
            </span>
            <Textarea
              className="min-h-24"
              name="description"
              placeholder="Коротко опишите, для каких ситуаций нужен шаблон"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              DOCX-файл
            </span>
            <input
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block w-full rounded-md border border-legal-border bg-white px-3 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-graphite-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              name="file"
              required
              type="file"
            />
            <p className="mt-2 text-xs leading-5 text-muted-500">
              Только DOCX, размер до 2 МБ. Файл не публикуется и не становится
              доступным другим пользователям.
            </p>
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-muted-500">
            <input
              className="mt-1 h-5 w-5 shrink-0 rounded border-legal-border text-gold-500 focus:ring-gold-500"
              name="legalReviewConsent"
              required
              type="checkbox"
              value="true"
            />
            <span>
              Я понимаю, что загруженный шаблон должен быть проверен
              специалистом.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-muted-500">
            <input
              className="mt-1 h-5 w-5 shrink-0 rounded border-legal-border text-gold-500 focus:ring-gold-500"
              name="personalDataConsent"
              required
              type="checkbox"
              value="true"
            />
            <span>
              Я согласен на обработку персональных данных для анализа шаблона.
            </span>
          </label>
        </div>

        {message ? (
          <div className="mt-5 rounded-md border border-gold-500/30 bg-gold-500/10 p-4 text-sm leading-6">
            {message}
          </div>
        ) : null}

        <Button className="mt-6 w-full" disabled={isLoading} size="lg" type="submit">
          {isLoading ? "Анализируем..." : "Загрузить и проанализировать"}
        </Button>
      </form>

      <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-soft lg:sticky lg:top-6 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
          Результат AI
        </p>
        {!result?.analysis ? (
          <div className="mt-4 rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-steel-300">
            После загрузки здесь появятся найденные переменные, поля формы,
            предупреждения и вопросы к юристу.
          </div>
        ) : (
          <AnalysisResult result={result} />
        )}
      </aside>
    </div>
  );
}

function AnalysisResult({ result }: { result: AnalyzeResponse }) {
  const analysis = result.analysis;

  if (!analysis) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-sm text-steel-300">Тип документа</p>
        <p className="mt-1 font-semibold">{analysis.documentType}</p>
      </div>
      <ResultList
        emptyText="Стороны не определены."
        items={analysis.parties}
        title="Стороны"
      />
      <div>
        <p className="text-sm text-steel-300">Поля формы</p>
        <div className="mt-2 space-y-2">
          {analysis.formFields.slice(0, 12).map((field) => (
            <div
              className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm"
              key={field.key}
            >
              <span className="font-semibold">{field.label}</span>
              <span className="ml-2 text-steel-300">({field.key})</span>
            </div>
          ))}
        </div>
      </div>
      <ResultList
        emptyText="Отдельных предупреждений нет."
        items={analysis.warnings}
        title="Предупреждения"
      />
      <ResultList
        emptyText="Вопросы не сформированы."
        items={analysis.lawyerQuestions}
        title="Вопросы к юристу"
      />
      {result.template ? (
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild variant="secondary">
            <Link href={`/generator?templateId=${result.template.id}`}>
              Использовать шаблон
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/templates/${result.template.id}/edit`}>
              Открыть настройки
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ResultList({
  emptyText,
  items,
  title
}: {
  emptyText: string;
  items: string[];
  title: string;
}) {
  return (
    <div>
      <p className="text-sm text-steel-300">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-steel-100">
        {items.length > 0 ? (
          items.slice(0, 8).map((item) => (
            <li className="rounded-md border border-white/10 bg-white/[0.04] p-3" key={item}>
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-steel-300">
            {emptyText}
          </li>
        )}
      </ul>
    </div>
  );
}
