import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  isInvalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isInvalid, rows = 4, ...props }, ref) => (
    <textarea
      className={cn(
        "w-full resize-y rounded-md border bg-white px-3 py-2 text-sm leading-6 text-graphite-950 outline-none transition placeholder:text-muted-500/70 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15",
        "break-words",
        isInvalid ? "border-red-500/70" : "border-legal-border",
        className
      )}
      ref={ref}
      rows={rows}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
