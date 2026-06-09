"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PrintActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="secondary">
        <Link href="/generator">Вернуться к форме</Link>
      </Button>
      <Button onClick={() => window.print()}>Скачать / распечатать PDF</Button>
    </div>
  );
}
