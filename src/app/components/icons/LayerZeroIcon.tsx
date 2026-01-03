import type { SVGProps } from "react";

export default function LayerZeroIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/layerzero.png"
      alt="LayerZero"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
