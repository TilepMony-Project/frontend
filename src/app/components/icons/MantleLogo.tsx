import type { SVGProps } from "react";

export default function MantleLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/mantle.png"
      alt="Mantle"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
