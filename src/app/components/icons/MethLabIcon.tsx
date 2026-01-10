import type { ImgHTMLAttributes } from "react";

export default function MethLabIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/logos/methlab.png" alt="MethLab" className={className} {...props} />;
}
