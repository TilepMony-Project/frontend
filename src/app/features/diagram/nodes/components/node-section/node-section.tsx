import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ label: string }>;

export function NodeSection({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-[var(--wb-node-section-gap)] rounded-[var(--wb-node-section-border-radius)] p-[var(--wb-node-section-padding)] border-[length:var(--wb-node-section-border-width)] border-[var(--wb-node-section-border-color)] text-[var(--ax-txt-primary-default)] ax-public-h10">
      <span>{label}</span>
      {children}
    </div>
  );
}
