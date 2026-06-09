"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode
} from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  size?: "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary:
    "border border-brass-300/70 bg-brass-400 text-matte-950 hover:bg-brass-300",
  secondary:
    "border border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.1]",
  ghost: "border border-transparent bg-transparent text-steel-200 hover:bg-white/[0.06]",
  danger:
    "border border-red-300/30 bg-red-500/10 text-red-100 hover:bg-red-500/18"
};

const sizes = {
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-3 text-base"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      size = "md",
      variant = "primary",
      type = "button",
      ...props
    },
    ref
  ) => {
    const classNames = cn(
      "inline-flex items-center justify-center rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-brass-300/60 disabled:cursor-not-allowed disabled:opacity-55",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(classNames, children.props.className)
      });
    }

    return (
      <button
        className={classNames}
        disabled={disabled}
        ref={ref}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
