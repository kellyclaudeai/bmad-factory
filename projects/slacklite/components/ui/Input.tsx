import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1 block text-xs font-semibold font-mono uppercase tracking-wide text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${props.id}-error`
              : helperText
                ? `${props.id}-helper`
                : undefined
          }
          className={cn(
            "w-full rounded-md border px-3 py-2",
            "bg-surface-3 text-primary text-sm font-sans placeholder:text-muted",
            "outline-none transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
              : "border-border focus:border-accent focus:ring-1 focus:ring-accent",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-xs text-error font-mono">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-xs text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
