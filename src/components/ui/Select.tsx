import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  isInvalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, isInvalid, children, ...props }, ref) => (
    <select
      className={cn(
        "min-h-11 w-full rounded-md border bg-white/[0.055] px-3 py-2 text-sm text-white outline-none transition focus:border-brass-300/70 focus:ring-2 focus:ring-brass-300/15",
        "[&>option]:bg-matte-900 [&>option]:text-white",
        isInvalid ? "border-red-300/60" : "border-white/12",
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
