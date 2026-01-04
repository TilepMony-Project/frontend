import type { ImgHTMLAttributes } from "react";

export default function MerchantMoeIcon({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/logos/merchantmoe.png"
      alt="MerchantMoe"
      className={className}
      {...props}
    />
  );
}
