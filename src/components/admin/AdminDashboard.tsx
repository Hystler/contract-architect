"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  premiumActive: boolean;
  premiumStatus: string | null;
  premiumPlan: string | null;
  premiumProvider: string | null;
  premiumEndsAt: string | null;
  aiRequestCount: number;
  aiTotalTokens: number;
};

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers("");
  }, []);

  async function loadUsers(search: string) {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/users${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as {
        users?: AdminUser[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Не удалось загрузить пользователей.");
      }

      setUsers(data.users || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить пользователей."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function grantPremium(userId: string, days: 7 | 30 | 90) {
    await mutatePremium("/api/admin/grant-premium", { userId, days });
  }

  async function revokePremium(userId: string) {
    await mutatePremium("/api/admin/revoke-premium", { userId });
  }

  async function mutatePremium(url: string, payload: unknown) {
    setMessage("");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Не удалось выполнить действие.");
      }

      setMessage(data.message || "Готово.");
      await loadUsers(query.trim());
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось выполнить действие."
      );
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <section className="rounded-lg border border-legal-border bg-paper-50 p-6 text-graphite-950 shadow-paper">
      <div className="flex flex-col gap-4 border-b border-legal-border pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            Пользователи и premium
          </h1>
        </div>
        <Button onClick={logout} variant="secondary">
          Выйти из админки
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по email"
          value={query}
        />
        <Button onClick={() => loadUsers(query.trim())} variant="secondary">
          Найти
        </Button>
      </div>

      {message ? (
        <div className="mt-5 rounded-md border border-gold-500/35 bg-gold-500/10 p-4 text-sm">
          {message}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-legal-border text-muted-500">
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Регистрация</th>
              <th className="py-3 pr-4">Premium</th>
              <th className="py-3 pr-4">AI-запросы</th>
              <th className="py-3 pr-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-5 text-muted-500" colSpan={5}>
                  Загрузка пользователей...
                </td>
              </tr>
            ) : null}
            {!isLoading && users.length === 0 ? (
              <tr>
                <td className="py-5 text-muted-500" colSpan={5}>
                  Пользователи не найдены.
                </td>
              </tr>
            ) : null}
            {users.map((user) => (
              <tr className="border-b border-legal-border align-top" key={user.id}>
                <td className="max-w-[260px] break-words py-4 pr-4 font-semibold">
                  {user.email}
                </td>
                <td className="py-4 pr-4 text-muted-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-4 pr-4">
                  <span
                    className={
                      user.premiumActive
                        ? "font-semibold text-green-700"
                        : "font-semibold text-muted-500"
                    }
                  >
                    {user.premiumActive ? "Premium активен" : "Premium не активен"}
                  </span>
                  <p className="mt-1 text-xs leading-5 text-muted-500">
                    До: {user.premiumEndsAt ? formatDate(user.premiumEndsAt) : "не указано"}
                  </p>
                  <p className="text-xs leading-5 text-muted-500">
                    {user.premiumProvider || "provider не указан"}
                  </p>
                </td>
                <td className="py-4 pr-4 text-muted-500">
                  {user.aiRequestCount} запросов
                  <p className="text-xs">{user.aiTotalTokens} токенов</p>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex min-w-[260px] flex-wrap gap-2">
                    <Button onClick={() => grantPremium(user.id, 7)} size="md" variant="secondary">
                      7 дней
                    </Button>
                    <Button onClick={() => grantPremium(user.id, 30)} size="md" variant="secondary">
                      30 дней
                    </Button>
                    <Button onClick={() => grantPremium(user.id, 90)} size="md" variant="secondary">
                      90 дней
                    </Button>
                    <Button onClick={() => revokePremium(user.id)} size="md" variant="danger">
                      Отключить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
