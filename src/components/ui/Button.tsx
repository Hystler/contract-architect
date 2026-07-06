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
    "border border-gold-400 bg-gold-500 text-ink-950 hover:bg-gold-400",
  secondary:
    "border border-legal-border bg-paper-50 text-graphite-950 hover:border-gold-500 hover:bg-surface-100",
  ghost:
    "border border-transparent bg-transparent text-steel-200 hover:bg-white/[0.06]",
  danger:
    "border border-red-300/40 bg-red-50 text-red-800 hover:bg-red-100"
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
      "inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400/70 disabled:cursor-not-allowed disabled:opacity-55",
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
