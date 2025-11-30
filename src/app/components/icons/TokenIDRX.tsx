import type { SVGProps } from "react";

export default function TokenIDRX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width="200"
      height="200"
      {...props}
    >
      <circle cx="100" cy="100" r="100" fill="#0052FF" />
      <text
        x="100"
        y="130"
        fontSize="120"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        X
      </text>
    </svg>
  );
}
