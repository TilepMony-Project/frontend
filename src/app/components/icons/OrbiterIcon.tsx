import type { SVGProps } from "react";

export default function OrbiterIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/orbiter.png"
      alt="Orbiter"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
