// Icon components for @workflow-builder/icons
// TODO: Replace with actual icon implementations

import type { ComponentType, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  className?: string;
};

export type WBIconProps = IconProps;

// Stub Icon component - replace with actual implementation
export const Icon: ComponentType<IconProps> = ({ size = 24, className, ...props }) => {
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
    </svg>
  );
};

export const WBIcon: ComponentType<WBIconProps> = Icon;

