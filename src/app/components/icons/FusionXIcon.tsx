import type { SVGProps } from "react";

export default function FusionXIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/fusionx.png"
      alt="FusionX"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
