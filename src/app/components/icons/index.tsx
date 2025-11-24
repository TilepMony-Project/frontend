'use client';

// Icon components
// TODO: Replace with actual icon implementations

import type { ComponentType, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  className?: string;
  name?: string;
};

export type WBIconProps = IconProps;

// Stub Icon component - replace with actual implementation
export const Icon: ComponentType<IconProps> = ({ 
  size = 24, 
  className, 
  name,
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <rect width="24" height="24" fill="currentColor" opacity="0.1" />
      {name && <text x="12" y="12" textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="currentColor">{name}</text>}
    </svg>
  );
};

export const WBIcon: ComponentType<WBIconProps> = Icon;

