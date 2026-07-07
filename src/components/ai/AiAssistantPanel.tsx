"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type AiAction =
  | "explain"
  | "risk_hints"
  | "missing_data"
  | "questions"
  | "rewrite";

type AiAssistantPanelProps = {
  contractType?: string;
  defaultSelectedText?: string;
  fullText: string;
  hasActiveSubscription?: boolean;
  hasPersonalDataConsent?: boolean;
};

const quickActions: Array<{
  action: AiAction;
  title: string;
  description: string;
}> = [
  {
    action: "explain",
    title: "Объяснить пункт",
    description: "Коротко и простым языком"
  },
  {
    action: "risk_hints",
    title: "Найти спорные места",
    description: "Подсказки по вниманию"
  },
  {
    action: "missing_data",
    title: "Проверить заполненность",
    description: "Каких данных не хватает"
  },
  {
    action: "rewrite",
    title: "Упростить формулировку",
    description: "Без автоматической замены"
  },
  {
    action: "questions",
    title: "Вопросы к юристу",
    description: "Что уточнить до подписания"
  }
];

export function AiAssistantPanel({
  contractType = "Договор оказания услуг",
  defaultSelectedText = "",
  fullText,
  hasActiveSubscription = false,
  hasPersonalDataConsent = false
}: AiAssistantPanelProps) {
  const [selectedText, setSelectedText] = useState(defaultSelectedText);
  const [userQuestion, setUserQuestion] = useState("");
  const [activeAction, setActiveAction] = useState<AiAction>("risk_hints");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    setSelectedText(defaultSelectedText);
  }, [defaultSelectedText]);

  const canUseSelectedText = useMemo(
    () => selectedText.trim().length > 0,
    [selectedText]
  );

  if (!hasActiveSubscription) {
    return <LockedAiPanel />;
  }

  async function askAssistant(action: AiAction) {
    setActiveAction(action);
    setError("");
    setResult("");
    setCopyMessage("");

    if (!hasPersonalDataConsent) {
      setError("Для отправки текста в AI нужно согласие на обработку персональных данных.");
      return;
    }

    if ((action === "explain" || action === "rewrite") && !canUseSelectedText) {
      setError("Вставьте пункт договора или заполните форму, чтобы AI было что объяснить.");
      return;
    }

    if (
      (action === "risk_hints" ||
        action === "missing_data" ||
        action === "questions") &&
      !fullText.trim()
    ) {
      setError("Заполните основные данные договора перед анализом.");
      return;
    }

    setIsLoading(true);

    try {
      const shouldSendFullText =
        action === "risk_hints" ||
        action === "missing_data" ||
        action === "questions";
      const response = await fetch("/api/ai/contract-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          contractType,
          selectedText: selectedText.trim() || undefined,
          fullText: shouldSendFullText ? fullText.trim() || undefined : undefined,
          userQuestion: userQuestion.trim() || undefined,
          personalDataConsent: hasPersonalDataConsent
        })
      });

      const data = (await response.json()) as {
        success: boolean;
        result?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI-помощник не смог обработать запрос.");
      }

      setResult(data.result || "");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI-помощник временно недоступен."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result);
    setCopyMessage("Ответ скопирован.");
  }

  return (
    <section className="rounded-lg border border-blue-400/20 bg-graphite-900 p-5 text-white shadow-ai">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
            AI-помощник
          </p>
          <h2 className="mt-2 text-xl font-semibold">Слой проверки и объяснений</h2>
        </div>
        <div className="h-2.5 w-2.5 rounded-full bg-blue-300 shadow-blue" />
      </div>

      <p className="mt-4 text-sm leading-6 text-steel-200">
        AI помогает объяснить текст и обратить внимание на возможные спорные
        места. Это не юридическая консультация и не замена проверки специалистом.
      </p>

      <div className="mt-5 grid gap-2">
        {quickActions.map((item) => (
          <button
            className="cursor-pointer rounded-md border border-white/10 bg-white/[0.045] p-3 text-left transition hover:border-blue-300/45 hover:bg-blue-300/10 focus:outline-none focus:ring-2 focus:ring-blue-300/45"
            disabled={isLoading || !hasPersonalDataConsent}
            key={item.action}
            onClick={() => askAssistant(item.action)}
            type="button"
          >
            <span className="block text-sm font-semibold text-white">
              {item.title}
            </span>
            <span className="mt-1 block text-xs leading-5 text-steel-300">
              {item.description}
            </span>
          </button>
        ))}
      </div>

      {!hasPersonalDataConsent ? (
        <div className="mt-5 rounded-md border border-gold-300/25 bg-gold-300/10 p-4 text-sm leading-6 text-gold-100">
          Перед отправкой текста в AI отметьте согласие на обработку
          персональных данных в форме генератора.
        </div>
      ) : null}

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-steel-200">
          Пункт или формулировка
        </span>
        <Textarea
          className="min-h-28 border-white/12 bg-white/[0.055] text-white placeholder:text-steel-300/60 focus:border-blue-300/70 focus:ring-blue-300/15"
          onChange={(event) => setSelectedText(event.target.value)}
          placeholder="Вставьте пункт договора, который нужно объяснить или упростить"
          value={selectedText}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-steel-200">
          Дополнительный вопрос
        </span>
        <Textarea
          className="min-h-20 border-white/12 bg-white/[0.055] text-white placeholder:text-steel-300/60 focus:border-blue-300/70 focus:ring-blue-300/15"
          onChange={(event) => setUserQuestion(event.target.value)}
          placeholder="Например: что здесь стоит уточнить перед подписанием?"
          value={userQuestion}
        />
      </label>

      {isLoading ? (
        <div className="mt-5 rounded-md border border-blue-300/20 bg-blue-300/10 p-4 text-sm text-blue-100">
          AI-помощник готовит ответ...
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-md border border-red-300/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 rounded-md border border-white/10 bg-paper-50 p-4 text-sm leading-6 text-graphite-900">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">Ответ AI</p>
            <Button onClick={copyResult} size="md" variant="secondary">
              Скопировать
            </Button>
          </div>
          <div className="whitespace-pre-line">{result}</div>
          {copyMessage ? (
            <p className="mt-3 text-xs font-medium text-blue-700">{copyMessage}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-steel-300">
        AI не меняет договор автоматически. Используйте ответ как черновик для
        обсуждения и финальной проверки со специалистом.
      </div>
    </section>
  );
}

function LockedAiPanel() {
  return (
    <section className="rounded-lg border border-blue-400/20 bg-graphite-900 p-5 text-white shadow-ai">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
        AI-помощник
      </p>
      <h2 className="mt-2 text-xl font-semibold">Доступ после оплаты</h2>
      <p className="mt-4 text-sm leading-6 text-steel-200">
        AI-проверка документов доступна только в подписке. Генерация DOCX, ZIP
        и PDF-preview остаётся доступной без AI.
      </p>
      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-steel-300">
        AI сможет объяснять пункты, подсвечивать места для проверки, искать
        пропущенные данные и готовить вопросы к юристу. Это не юридическая
        консультация.
      </div>
      <Button asChild className="mt-5 w-full" size="lg">
        <Link href="/pricing">Оформить доступ</Link>
      </Button>
    </section>
  );
}
