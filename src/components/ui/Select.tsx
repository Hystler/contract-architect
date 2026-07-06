import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  isInvalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, isInvalid, children, ...props }, ref) => (
    <select
      className={cn(
        "min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-graphite-950 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15",
        "[&>option]:bg-white [&>option]:text-graphite-950",
        isInvalid ? "border-red-500/70" : "border-legal-border",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
