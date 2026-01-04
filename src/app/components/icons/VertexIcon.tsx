import type { ImgHTMLAttributes } from "react";

export default function VertexIcon({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/logos/vertex.png"
      alt="Vertex"
      className={className}
      {...props}
    />
  );
}
