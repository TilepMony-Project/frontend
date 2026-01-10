import type { SVGProps } from "react";

export default function CompoundIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/compound.png"
      alt="Compound"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
