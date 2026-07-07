"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";

type FieldErrors = Record<string, string[] | undefined>;

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword })
      });
      const data = (await response.json()) as {
        message?: string;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setErrors(data.errors || {});
        throw new Error(data.message || "Не удалось зарегистрироваться.");
      }

      window.location.href = "/account";
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось зарегистрироваться."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link className="font-semibold text-gold-300" href="/login">
            Войти
          </Link>
        </>
      }
      lead="Создайте аккаунт, чтобы затем получить premium-доступ к AI-помощнику."
      title="Регистрация"
    >
      <Field label="Email" message={errors.email?.[0]}>
        <Input
          autoComplete="email"
          isInvalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </Field>
      <Field label="Пароль" message={errors.password?.[0]}>
        <Input
          autoComplete="new-password"
          isInvalid={Boolean(errors.password)}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Минимум 8 символов"
          type="password"
          value={password}
        />
      </Field>
      <Field label="Повторите пароль" message={errors.confirmPassword?.[0]}>
        <Input
          autoComplete="new-password"
          isInvalid={Boolean(errors.confirmPassword)}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Повторите пароль"
          type="password"
          value={confirmPassword}
        />
      </Field>
      {message ? <FormMessage>{message}</FormMessage> : null}
      <Button className="w-full" disabled={isSubmitting} onClick={submit} size="lg">
        {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
      </Button>
    </AuthCard>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = (await response.json()) as {
        message?: string;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setErrors(data.errors || {});
        throw new Error(data.message || "Не удалось войти.");
      }

      window.location.href = "/generator";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось войти.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      footer={
        <>
          Нет аккаунта?{" "}
          <Link className="font-semibold text-gold-300" href="/register">
            Зарегистрироваться
          </Link>
        </>
      }
      lead="Войдите, чтобы использовать premium-возможности и AI-проверку документов."
      title="Вход"
    >
      <Field label="Email" message={errors.email?.[0]}>
        <Input
          autoComplete="email"
          isInvalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </Field>
      <Field label="Пароль" message={errors.password?.[0]}>
        <Input
          autoComplete="current-password"
          isInvalid={Boolean(errors.password)}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ваш пароль"
          type="password"
          value={password}
        />
      </Field>
      {message ? <FormMessage>{message}</FormMessage> : null}
      <Button className="w-full" disabled={isSubmitting} onClick={submit} size="lg">
        {isSubmitting ? "Входим..." : "Войти"}
      </Button>
    </AuthCard>
  );
}

function AuthCard({
  children,
  footer,
  lead,
  title
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  lead: string;
  title: string;
}) {
  return (
    <section className="mx-auto w-full max-w-md rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white shadow-soft">
      <Link className="text-sm font-semibold text-white" href="/">
        Contract Architect
      </Link>
      <h1 className="mt-6 font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-steel-300">{lead}</p>
      <div className="mt-6 space-y-4">{children}</div>
      <p className="mt-6 text-center text-sm text-steel-300">{footer}</p>
    </section>
  );
}

function Field({
  children,
  label,
  message
}: {
  children: React.ReactNode;
  label: string;
  message?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-steel-200">{label}</span>
      {children}
      <FieldError message={message} />
    </label>
  );
}

function FormMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-red-300/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
      {children}
    </div>
  );
}
