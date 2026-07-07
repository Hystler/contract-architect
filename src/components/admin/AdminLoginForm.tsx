"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminLoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
      });
      const data = (await readJsonResponse(response)) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Не удалось войти в админку."
        );
      }

      window.location.href = "/admin";
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось войти в админку."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
        Скрытая админка
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Вход</h1>
      <p className="mt-3 text-sm leading-6 text-steel-300">
        Используйте `ADMIN_LOGIN` и `ADMIN_PASSWORD` из переменных окружения.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-steel-200">
            Login
          </span>
          <Input
            autoComplete="username"
            onChange={(event) => setLogin(event.target.value)}
            placeholder="admin"
            value={login}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-steel-200">
            Password
          </span>
          <Input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль администратора"
            type="password"
            value={password}
          />
        </label>
        {message ? (
          <div className="rounded-md border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">
            {message}
          </div>
        ) : null}
        <Button className="w-full" disabled={isSubmitting} onClick={submit}>
          {isSubmitting ? "Проверяем..." : "Войти в админку"}
        </Button>
      </div>
    </section>
  );
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    throw new Error("Сервер вернул некорректный ответ.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Сервер вернул некорректный ответ.");
  }
}
