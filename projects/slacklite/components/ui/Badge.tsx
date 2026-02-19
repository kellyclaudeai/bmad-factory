import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "error" | "warning";
  size?: "sm" | "md";
}

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full";

  const variantStyles = {
    default: "bg-primary-brand text-white",
    success: "bg-success text-white",
    error: "bg-error text-white",
    warning: "bg-warning text-gray-900",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs min-w-[20px] h-5",
    md: "px-2.5 py-1 text-sm min-w-[24px] h-6",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
