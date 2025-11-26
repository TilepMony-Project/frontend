import type { PropsWithChildren } from "react";

export function IndicatorDot({ children }: PropsWithChildren) {
  return (
    <div className="relative before:content-[''] before:absolute before:bg-[var(--wb-indicator-dot-background-color)] before:rounded-full before:h-[var(--wb-indicator-dot-size)] before:w-[var(--wb-indicator-dot-size)] before:animate-[pulse_2s_infinite] before:left-[calc(-1*var(--wb-sidebar-horizontal-padding)-var(--wb-indicator-dot-radius))] before:top-[calc(50%-var(--wb-indicator-dot-radius))]">
      {children}
    </div>
  );
}
