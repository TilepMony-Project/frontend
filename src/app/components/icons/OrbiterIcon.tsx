import type { SVGProps } from "react";

export default function OrbiterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="#F0B90B" />
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="12"
        stroke="white"
        strokeWidth="4"
        transform="rotate(-30 50 50)"
      />
      <circle cx="50" cy="50" r="10" fill="white" />
    </svg>
  );
}
