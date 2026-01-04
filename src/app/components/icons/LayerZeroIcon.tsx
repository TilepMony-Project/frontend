import type { ImgHTMLAttributes } from "react";

export default function LayerZeroIcon({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/logos/layerzero.png"
      alt="LayerZero"
      className={className}
      {...props}
    />
  );
}
