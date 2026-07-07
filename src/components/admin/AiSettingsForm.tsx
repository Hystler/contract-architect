"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type AiSettings = {
  enabled: boolean;
  provider: "openai";
  model: string;
  maxRequestsPerWindow: number;
  rateLimitWindowSeconds: number;
  customInstruction: string;
  updatedAt: string;
};

type SettingsResponse = {
  settings: AiSettings;
  hasApiKey: boolean;
  adminTokenConfigured: boolean;
  canWriteWithoutToken: boolean;
  isProduction: boolean;
};

const fallbackSettings: AiSettings = {
  enabled: false,
  provider: "openai",
  model: "gpt-5-mini",
  maxRequestsPerWindow: 8,
  rateLimitWindowSeconds: 300,
  customInstruction: "",
  updatedAt: new Date().toISOString()
};

export function AiSettingsForm() {
  const [settings, setSettings] = useState<AiSettings>(fallbackSettings);
  const [status, setStatus] = useState<SettingsResponse | null>(null);
  const [adminToken, setAdminToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setAdminToken(sessionStorage.getItem("contract-architect-admin-token") || "");
    loadSettings();
  }, []);

  const canSave = useMemo(() => {
    if (!status) {
      return false;
    }

    if (status.canWriteWithoutToken) {
      return true;
    }

    return status.adminTokenConfigured && adminToken.trim().length > 0;
  }, [adminToken, status]);

  async function loadSettings() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/ai-settings", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить настройки.");
      }

      const data = (await response.json()) as SettingsResponse;
      setStatus(data);
      setSettings(data.settings);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить настройки."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    setIsSaving(true);
    setMessage("");
    setError("");
    setTestResult("");

    try {
      sessionStorage.setItem(
        "contract-architect-admin-token",
        adminToken.trim()
      );

      const response = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken.trim() ? { "x-admin-token": adminToken.trim() } : {})
        },
        body: JSON.stringify(settings)
      });

      const data = (await response.json()) as {
        message?: string;
        settings?: AiSettings;
      };

      if (!response.ok) {
        throw new Error(data.message || "Не удалось сохранить настройки.");
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      setMessage(data.message || "Настройки сохранены.");
      await loadSettings();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Не удалось сохранить настройки."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function testAssistant() {
    setIsTesting(true);
    setTestResult("");
    setError("");

    try {
      const response = await fetch("/api/ai/contract-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "risk_hints",
          fullText:
            "Договор оказания услуг. Срок оплаты и порядок передачи результата не указаны.",
          personalDataConsent: true
        })
      });

      const data = (await response.json()) as {
        success: boolean;
        result?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI-помощник не ответил.");
      }

      setTestResult(data.result || "AI-помощник ответил успешно.");
    } catch (testError) {
      setTestResult(
        testError instanceof Error
          ? testError.message
          : "Не удалось проверить AI-помощника."
      );
    } finally {
      setIsTesting(false);
    }
  }

  function updateSettings(update: Partial<AiSettings>) {
    setSettings((current) => ({
      ...current,
      ...update
    }));
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-legal-border bg-paper-50 p-6 text-graphite-950 shadow-paper">
        Загрузка настроек админки...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-legal-border bg-paper-50 p-6 text-graphite-950 shadow-paper">
        <div className="flex flex-col gap-4 border-b border-legal-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
              AI-настройки
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Управление AI-помощником
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-500">
              Эти настройки управляют runtime-поведением AI. API-ключ хранится
              только в переменных окружения и не отображается в интерфейсе.
            </p>
          </div>

          <button
            className="min-h-11 cursor-pointer rounded-md border border-legal-border bg-white px-4 py-2 text-sm font-semibold transition hover:border-gold-500"
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            type="button"
          >
            {settings.enabled ? "Отключить AI" : "Включить AI"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Провайдер
            </span>
            <Input readOnly value="OpenAI" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Модель
            </span>
            <Input
              onChange={(event) => updateSettings({ model: event.target.value })}
              placeholder="gpt-5-mini"
              value={settings.model}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Запросов за окно
            </span>
            <Input
              min={1}
              max={60}
              onChange={(event) =>
                updateSettings({
                  maxRequestsPerWindow: Number(event.target.value)
                })
              }
              type="number"
              value={settings.maxRequestsPerWindow}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Окно лимита, секунд
            </span>
            <Input
              min={30}
              max={3600}
              onChange={(event) =>
                updateSettings({
                  rateLimitWindowSeconds: Number(event.target.value)
                })
              }
              type="number"
              value={settings.rateLimitWindowSeconds}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Дополнительная инструкция AI
            </span>
            <Textarea
              className="min-h-32"
              onChange={(event) =>
                updateSettings({ customInstruction: event.target.value })
              }
              placeholder="Например: отвечать максимально кратко и всегда выделять вопросы к специалисту"
              value={settings.customInstruction}
            />
          </label>
        </div>

        <div className="mt-6 rounded-md border border-legal-border bg-surface-100 p-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-500">
              Ключ доступа администратора
            </span>
            <Input
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="ADMIN_ACCESS_TOKEN"
              type="password"
              value={adminToken}
            />
          </label>
          <p className="mt-3 text-xs leading-5 text-muted-500">
            Ключ сохраняется только в sessionStorage этого браузера. Если
            `ADMIN_ACCESS_TOKEN` не задан в production, изменение настроек
            заблокировано.
          </p>
        </div>

        {message ? (
          <div className="mt-5 rounded-md border border-gold-500/30 bg-gold-500/10 p-4 text-sm text-graphite-950">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-md border border-red-300/50 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={testAssistant} variant="secondary">
            {isTesting ? "Проверка..." : "Проверить AI"}
          </Button>
          <Button disabled={!canSave || isSaving} onClick={saveSettings}>
            {isSaving ? "Сохранение..." : "Сохранить настройки"}
          </Button>
        </div>

        {testResult ? (
          <div className="mt-5 whitespace-pre-line rounded-md border border-intelligence-500/25 bg-intelligence-100 p-4 text-sm leading-6 text-graphite-950">
            {testResult}
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        <StatusCard
          label="AI"
          value={settings.enabled ? "Включён" : "Отключён"}
          tone={settings.enabled ? "good" : "muted"}
        />
        <StatusCard
          label="OPENAI_API_KEY"
          value={status?.hasApiKey ? "Подключён" : "Не задан"}
          tone={status?.hasApiKey ? "good" : "warning"}
        />
        <StatusCard
          label="ADMIN_ACCESS_TOKEN"
          value={status?.adminTokenConfigured ? "Задан" : "Не задан"}
          tone={status?.adminTokenConfigured ? "good" : "warning"}
        />

        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white">
          <h3 className="text-lg font-semibold">Что добавить в Vercel</h3>
          <div className="mt-4 space-y-2 rounded-md border border-white/10 bg-ink-950 p-4 font-mono text-xs leading-6 text-steel-200">
            <p>OPENAI_API_KEY=...</p>
            <p>OPENAI_MODEL=gpt-5-mini</p>
            <p>AI_ENABLED=true</p>
            <p>AI_MONTHLY_TOKEN_LIMIT=50000</p>
            <p>ADMIN_ACCESS_TOKEN=...</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-steel-300">
            После изменения env в Vercel нужно сделать redeploy. Runtime-настройки
            из этой страницы могут сброситься при cold start или новом деплое.
          </p>
        </div>
      </aside>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "good" | "warning" | "muted";
}) {
  const toneClass = {
    good: "border-green-300/35 bg-green-50 text-green-800",
    warning: "border-gold-500/35 bg-gold-500/10 text-graphite-950",
    muted: "border-legal-border bg-paper-50 text-muted-500"
  }[tone];

  return (
    <div className={`rounded-lg border p-5 shadow-paper ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
