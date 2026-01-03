import type { SVGProps } from "react";

export default function MethLabIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/methlab.png"
      alt="MethLab"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
