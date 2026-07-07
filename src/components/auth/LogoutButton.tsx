"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function logout() {
    setIsSubmitting(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <Button disabled={isSubmitting} onClick={logout} variant="secondary">
      {isSubmitting ? "Выходим..." : "Выйти"}
    </Button>
  );
}
