'use client';

import type { ComponentType, SVGProps } from 'react';
import {
  Save,
  Upload,
  Download,
  Undo2,
  Redo2,
  Network,
  LayoutGrid,
  DollarSign,
  Coins,
  ArrowLeftRight,
  Link2,
  Building2,
  Send,
  ShieldCheck,
  Clock,
  GitBranch,
  Lock,
  Image,
  Archive,
  MoreVertical,
  PanelLeft,
  Box,
  PlusCircle,
  GripVertical,
  X,
  Maximize2,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Pencil,
  PencilOff,
  Moon,
  Sun,
  ChevronDown,
  Info,
  MinusCircle,
  SlidersHorizontal,
  Trash2,
  Plus,
  Asterisk,
} from 'lucide-react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  className?: string;
  name?: string;
};

export type WBIconProps = IconProps;

// Icon name mapping to actual icon components
// Uses Lucide React as primary icon library
const iconMap: Record<string, ComponentType<IconProps>> = {
  // Common UI icons (Lucide React)
  FloppyDisk: Save,
  Export: Upload,
  DownloadSimple: Download,
  ArrowUUpLeft: Undo2,
  ArrowUUpRight: Redo2,
  TreeStructureDown: Network,
  Cards: LayoutGrid,
  Copy: Copy,
  
  // Modal and form icons
  LockSimpleOpen: Lock,
  Image: Image,
  Archive: Archive,
  DotsThreeVertical: MoreVertical,
  SidebarSimple: PanelLeft,
  Cube: Box,
  PlusCircle: PlusCircle,
  DotsSixVertical: GripVertical,
  X: X,
  FrameCorners: Maximize2,
  Spinner: Loader2,
  CheckCircle: CheckCircle2,
  XCircle: XCircle,
  
  // Additional icons used in components
  Pencil: Pencil,
  PencilSimple: Pencil,
  PencilSimpleSlash: PencilOff,
  PencilOff: PencilOff,
  Moon: Moon,
  MoonStars: Moon,
  Sun: Sun,
  ChevronDown: ChevronDown,
  CaretDown: ChevronDown,
  Info: Info,
  MinusCircle: MinusCircle,
  SlidersHorizontal: SlidersHorizontal,
  Trash: Trash2,
  Trash2: Trash2,
  Plus: Plus,
  Asterisk: Asterisk,
  
  // Node icons - TilepMoney (Lucide React)
  CurrencyDollar: DollarSign, // Deposit
  Coins: Coins, // Mint
  ArrowsClockwise: ArrowLeftRight, // Swap
  Bridge: Link2, // Bridge (using Link2 as bridge icon)
  Bank: Building2, // Redeem
  PaperPlaneRight: Send, // Transfer
  Vault: ShieldCheck, // Vault (using ShieldCheck as vault icon)
  Clock: Clock, // Wait
  GitBranch: GitBranch, // Partition
};

// Try to get icon from mapping
function getIconComponent(name?: string): ComponentType<IconProps> | null {
  if (!name) return null;

  // Check icon map first
  if (iconMap[name]) {
    return iconMap[name];
  }

  return null;
}

export const Icon: ComponentType<IconProps> = ({ 
  size = 24, 
  className, 
  name,
  ...props 
}) => {
  if (!name) {
    return null;
  }

  const IconComponent = getIconComponent(name);

  if (IconComponent) {
    // Convert size to number if it's a string like "large" or "small"
    let iconSize: number | string = size;
    if (typeof size === 'string') {
      if (size === 'large') iconSize = 32;
      else if (size === 'small') iconSize = 16;
      else if (size === 'medium') iconSize = 24;
      else iconSize = Number.parseInt(size, 10) || 24;
    }

    // Add spinning animation for Spinner icon
    const spinnerClassName = name === 'Spinner' 
      ? `${className || ''} animate-spin`.trim()
      : className;

    return (
      <IconComponent
        size={iconSize}
        className={spinnerClassName}
        {...props}
      />
    );
  }

  // Final fallback: show placeholder with icon name
  const iconSize = typeof size === 'string' 
    ? (size === 'large' ? 32 : size === 'small' ? 16 : 24)
    : size;
    
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={name}
      role="img"
      className={className}
      {...props}
    >
      <rect width="24" height="24" fill="currentColor" opacity="0.1" />
      <text x="12" y="12" textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="currentColor">
        {name.substring(0, 2)}
      </text>
    </svg>
  );
};

export const WBIcon: ComponentType<WBIconProps> = Icon;
