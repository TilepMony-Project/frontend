import type { ImgHTMLAttributes } from "react";

export default function OrbiterIcon({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/logos/orbiter.png"
      alt="Orbiter"
      className={className}
      {...props}
    />
  );
}
