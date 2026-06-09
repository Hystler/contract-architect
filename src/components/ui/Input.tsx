import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  isInvalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isInvalid, ...props }, ref) => (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border bg-white/[0.055] px-3 py-2 text-sm text-white outline-none transition placeholder:text-steel-300/55 focus:border-brass-300/70 focus:ring-2 focus:ring-brass-300/15",
        isInvalid ? "border-red-300/60" : "border-white/12",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";
