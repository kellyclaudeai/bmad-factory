"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SwitchProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

// Minimal switch (shadcn-like API) for dashboard view controls.
export function Switch({
  checked = false,
  onCheckedChange,
  id,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex h-5 w-9 items-center rounded-full border",
        "transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        checked
          ? "bg-terminal-green/20 border-terminal-green"
          : "bg-terminal-dim/10 border-terminal-border",
        className,
      )}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full transition-transform",
          checked ? "translate-x-4 bg-terminal-green" : "translate-x-0.5 bg-terminal-dim",
        )}
      />
    </button>
  );
}
