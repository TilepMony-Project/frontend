import type { SVGProps } from "react";

export default function HyperlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="#3578E5" />
      <path
        d="M35 30 V70 M65 30 V70 M35 50 H65"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
