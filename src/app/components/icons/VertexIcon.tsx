import type { SVGProps } from "react";

export default function VertexIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <img
      src="/logos/vertex.png"
      alt="Vertex"
      className={className}
      // @ts-ignore
      {...(props as any)}
    />
  );
}
