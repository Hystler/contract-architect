import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  isInvalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isInvalid, ...props }, ref) => (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-graphite-950 outline-none transition placeholder:text-muted-500/70 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15",
        isInvalid ? "border-red-500/70" : "border-legal-border",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";
