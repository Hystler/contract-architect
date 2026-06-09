import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  isInvalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isInvalid, rows = 4, ...props }, ref) => (
    <textarea
      className={cn(
        "w-full resize-y rounded-md border bg-white/[0.055] px-3 py-2 text-sm leading-6 text-white outline-none transition placeholder:text-steel-300/55 focus:border-brass-300/70 focus:ring-2 focus:ring-brass-300/15",
        "break-words",
        isInvalid ? "border-red-300/60" : "border-white/12",
        className
      )}
      ref={ref}
      rows={rows}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
