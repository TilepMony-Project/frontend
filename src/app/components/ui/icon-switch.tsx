"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";

export interface IconSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  icon?: React.ReactNode;
  IconChecked?: React.ReactNode;
  variant?: "default" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
}

const variantStyles = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

export function IconSwitch({
  checked = false,
  onChange,
  icon,
  IconChecked,
  variant = "default",
  className,
  disabled = false,
}: IconSwitchProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const currentIcon = checked ? IconChecked : icon;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-lg p-2.5 text-sm font-medium",
        "transition-all duration-300 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:scale-105 active:scale-95",
        "shadow-sm hover:shadow-md",
        variantStyles[variant],
        className
      )}
      aria-pressed={checked}
    >
      <span className="transition-transform duration-300 group-hover:rotate-12">{currentIcon}</span>
    </button>
  );
}
