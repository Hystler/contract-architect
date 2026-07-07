"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const storageKey = "contract-architect-cookie-consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!localStorage.getItem(storageKey));
  }, []);

  function saveChoice(choice: "accepted" | "declined") {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        choice,
        savedAt: new Date().toISOString()
      })
    );
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/95 px-4 py-4 text-white shadow-soft backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-steel-200">
          Мы используем необходимые cookies для работы сайта. Аналитические
          cookies будут использоваться только с вашего согласия. Подробнее — в{" "}
          <Link className="font-semibold text-gold-300 hover:text-gold-400" href="/cookies">
            Политике cookies
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => saveChoice("declined")} variant="ghost">
            Отклонить
          </Button>
          <Button onClick={() => saveChoice("accepted")}>Принять</Button>
        </div>
      </div>
    </div>
  );
}
