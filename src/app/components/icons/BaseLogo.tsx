import type { SVGProps } from "react";

export default function BaseLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/base.png"
      alt="Base"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
