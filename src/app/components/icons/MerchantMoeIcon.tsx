import type { SVGProps } from "react";

export default function MerchantMoeIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/merchantmoe.png"
      alt="MerchantMoe"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
