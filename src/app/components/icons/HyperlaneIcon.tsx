import type { SVGProps } from "react";

export default function HyperlaneIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/hyperlane.png"
      alt="Hyperlane"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
