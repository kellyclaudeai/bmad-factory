import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-accent hover:bg-accent-hover text-inverse font-semibold",
    "border border-accent hover:border-accent-hover",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  secondary: [
    "bg-surface-3 hover:bg-surface-4 text-primary",
    "border border-border hover:border-border-strong",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  destructive: [
    "bg-error-subtle hover:bg-error text-error hover:text-inverse",
    "border border-error",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  ghost: [
    "bg-transparent hover:bg-surface-3 text-secondary hover:text-primary",
    "border border-transparent",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded",
  md: "px-4 py-2 text-sm rounded-md min-h-[44px]",
  lg: "px-6 py-2.5 text-sm rounded-md min-h-[44px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
