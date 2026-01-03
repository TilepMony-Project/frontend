import type { SVGProps } from "react";

export default function LayerZeroIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="black" />
      <text
        x="50"
        y="60"
        fontSize="16"
        fill="white"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        ZRO
      </text>
      <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="3" />
    </svg>
  );
}
