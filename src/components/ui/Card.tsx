import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-legal-border bg-paper-50 text-graphite-950 shadow-paper",
        className
      )}
      {...props}
    />
  );
}
