import type { SVGProps } from "react";

export default function InitCapitalIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/initcapital.png"
      alt="InitCapital"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
