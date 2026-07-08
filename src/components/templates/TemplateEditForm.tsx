"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  templateCategories,
  type TemplateVariable
} from "@/lib/templates/templateCatalog";

type EditableTemplate = {
  id: string;
  category: string;
  description: string;
  isActive: boolean;
  isPremium: boolean;
  name: string;
  variables: TemplateVariable[];
};

export function TemplateEditForm({ template }: { template: EditableTemplate }) {
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [variablesText, setVariablesText] = useState(() =>
    JSON.stringify(template.variables, null, 2)
  );

  const variablePreview = useMemo(() => {
    try {
      const parsed = JSON.parse(variablesText) as TemplateVariable[];
      return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
    } catch {
      return [];
    }
  }, [variablesText]);

  async function saveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      let variables: unknown;

      try {
        variables = JSON.parse(variablesText);
      } catch {
        throw new Error("Список переменных должен быть корректным JSON.");
      }

      const response = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category: formData.get("category"),
          description: formData.get("description"),
          isActive: formData.get("isActive") === "on",
          isPremium: formData.get("isPremium") === "on",
          name: formData.get("name"),
          variables
        })
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Не удалось сохранить шаблон.");
      }

      setMessage("Настройки шаблона сохранены.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось сохранить шаблон."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)]">
      <form
        className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper"
        onSubmit={saveTemplate}
      >
        <h2 className="text-xl font-semibold">Настройки шаблона</h2>
        <p className="mt-2 text-sm leading-6 text-muted-500">
          DOCX-файл редактируется в Word. Здесь настраиваются поля формы и
          доступность шаблона в генераторе.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Название
            </span>
            <Input defaultValue={template.name} name="name" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Категория
            </span>
            <Select defaultValue={template.category} name="category" required>
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
              defaultValue={template.description}
              name="description"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Переменные формы JSON
            </span>
            <Textarea
              className="min-h-72 font-mono text-xs"
              onChange={(event) => setVariablesText(event.target.value)}
              value={variablesText}
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-muted-500">
            <input
              className="h-5 w-5 rounded border-legal-border text-gold-500 focus:ring-gold-500"
              defaultChecked={template.isActive}
              name="isActive"
              type="checkbox"
            />
            Активен в генераторе
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-muted-500">
            <input
              className="h-5 w-5 rounded border-legal-border text-gold-500 focus:ring-gold-500"
              defaultChecked={template.isPremium}
              name="isPremium"
              type="checkbox"
            />
            Требует premium-доступ
          </label>
        </div>

        {message ? (
          <div className="mt-5 rounded-md border border-gold-500/30 bg-gold-500/10 p-4 text-sm">
            {message}
          </div>
        ) : null}

        <Button className="mt-6" disabled={isSaving} type="submit">
          {isSaving ? "Сохраняем..." : "Сохранить настройки"}
        </Button>
      </form>

      <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-soft lg:sticky lg:top-6 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
          Переменные
        </p>
        <div className="mt-4 space-y-2">
          {variablePreview.length > 0 ? (
            variablePreview.map((variable) => (
              <div
                className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm"
                key={variable.key}
              >
                <p className="font-semibold">{variable.label}</p>
                <p className="mt-1 text-xs text-steel-300">{variable.key}</p>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-steel-300">
              JSON пока не распознан.
            </div>
          )}
        </div>
        <Button asChild className="mt-5 w-full" variant="secondary">
          <Link href={`/generator?templateId=${template.id}`}>
            Использовать в генераторе
          </Link>
        </Button>
      </aside>
    </div>
  );
}
