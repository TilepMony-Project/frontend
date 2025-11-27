"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DotPattern } from "@/components/ui/dot-pattern";

type DotPatternLinearGradientProps = {
  children: ReactNode;
  className?: string;
};

export function DotPatternLinearGradient({ children, className }: DotPatternLinearGradientProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full",
        "bg-[radial-gradient(circle_at_top,_rgba(18,150,231,0.1),transparent_50%),_linear-gradient(to_bottom,#ffffff,#eeeff3)]",
        "dark:bg-[radial-gradient(circle_at_top,_rgba(18,150,231,0.25),transparent_55%),_linear-gradient(to_bottom,#151516,#27282b)]",
        className
      )}
    >
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn("text-[#c0c6d6]", "dark:text-[#505058]")}
      />

      <div className="relative z-10 flex min-h-screen flex-col text-foreground">{children}</div>
    </div>
  );
}
