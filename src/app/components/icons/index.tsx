"use client";

import {
  Archive,
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Asterisk,
  BarChart3,
  Box,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Coins,
  Copy,
  DollarSign,
  Download,
  FileText,
  GitBranch,
  GripVertical,
  Hand,
  Image,
  Info,
  Key,
  LayoutGrid,
  Link2,
  List,
  Loader2,
  Lock,
  Maximize2,
  MinusCircle,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Network,
  PanelLeft,
  Pencil,
  PencilOff,
  Play,
  Plus,
  PlusCircle,
  Pointer,
  Redo2,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Undo2,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import Exchange1inch from "@web3icons/react/icons/exchanges/Exchange1inch";
import ExchangeUniswap from "@web3icons/react/icons/exchanges/ExchangeUniswap";
import TokenCRV from "@web3icons/react/icons/tokens/TokenCRV";
import TokenDAI from "@web3icons/react/icons/tokens/TokenDAI";
import TokenUSDC from "@web3icons/react/icons/tokens/TokenUSDC";
// Import web3 icons for dynamic node icons
import TokenUSDT from "@web3icons/react/icons/tokens/TokenUSDT";

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
  Save: Save,
  Upload: Upload,
  Download: Download,
  Undo2: Undo2,
  Redo2: Redo2,
  Network: Network,
  LayoutGrid: LayoutGrid,
  ArrowLeft: ArrowLeft,
  ArrowRight: ArrowRight,
  Search: Search,
  List: List,
  Copy: Copy,
  User: User,
  FileText: FileText,

  // Modal and form icons
  Lock: Lock,
  Key: Key,
  Image: Image,
  Archive: Archive,
  MoreVertical: MoreVertical,
  MoreHorizontal: MoreHorizontal,
  PanelLeft: PanelLeft,
  Box: Box,
  PlusCircle: PlusCircle,
  GripVertical: GripVertical,
  X: X,
  Maximize2: Maximize2,
  Loader2: Loader2,
  Hand: Hand,
  Pointer: Pointer,
  Check: Check,
  CheckCircle2: CheckCircle2,
  AlertCircle: AlertCircle,
  XCircle: XCircle,

  // Additional icons used in components
  Pencil: Pencil,
  PencilOff: PencilOff,
  Moon: Moon,
  Sun: Sun,
  ChevronDown: ChevronDown,
  ChevronRight: ChevronRight,
  Info: Info,
  MinusCircle: MinusCircle,
  SlidersHorizontal: SlidersHorizontal,
  Trash2: Trash2,
  Play: Play,
  Plus: Plus,
  Asterisk: Asterisk,
  BarChart3: BarChart3,

  // Node icons - TilepMoney (Lucide React)
  DollarSign: DollarSign, // Deposit
  Coins: Coins, // Mint
  ArrowLeftRight: ArrowLeftRight, // Swap
  Link2: Link2, // Bridge
  Building2: Building2, // Redeem
  Send: Send, // Transfer
  ShieldCheck: ShieldCheck, // Vault
  RefreshCw: RefreshCw, // Schedule
  Clock: Clock, // Wait
  GitBranch: GitBranch, // Partition
  TrendingUp: TrendingUp, // Yield Deposit
  TrendingDown: TrendingDown, // Yield Withdraw
  ChevronUp: ChevronUp, // UI Toggle

  // Web3 icons for dynamic node icons (swap providers, issuers)
  TokenUSDT: TokenUSDT as unknown as ComponentType<IconProps>,
  TokenUSDC: TokenUSDC as unknown as ComponentType<IconProps>,
  TokenDAI: TokenDAI as unknown as ComponentType<IconProps>,
  TokenCRV: TokenCRV as unknown as ComponentType<IconProps>,
  ExchangeUniswap: ExchangeUniswap as unknown as ComponentType<IconProps>,
  Exchange1inch: Exchange1inch as unknown as ComponentType<IconProps>,
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

import CompoundIcon from "./CompoundIcon";
import FusionXIcon from "./FusionXIcon";
import HyperlaneIcon from "./HyperlaneIcon";
import InitCapitalIcon from "./InitCapitalIcon";
import LayerZeroIcon from "./LayerZeroIcon";
import MerchantMoeIcon from "./MerchantMoeIcon";
import MethLabIcon from "./MethLabIcon";
import OrbiterIcon from "./OrbiterIcon";
import VertexIcon from "./VertexIcon";

export {
  CompoundIcon,
  FusionXIcon,
  HyperlaneIcon,
  InitCapitalIcon,
  LayerZeroIcon,
  MerchantMoeIcon,
  MethLabIcon,
  OrbiterIcon,
  VertexIcon,
};

export const Icon: ComponentType<IconProps> = ({ size = 24, className, name, ...props }) => {
  if (!name) {
    return null;
  }

  const IconComponent = getIconComponent(name);

  if (IconComponent) {
    // Convert size to number if it's a string like "large" or "small"
    let iconSize: number | string = size;
    if (typeof size === "string") {
      if (size === "large") iconSize = 32;
      else if (size === "small") iconSize = 16;
      else if (size === "medium") iconSize = 24;
      else iconSize = Number.parseInt(size, 10) || 24;
    }

    // Add spinning animation for Spinner icon
    const spinnerClassName =
      name === "Loader2" ? `${className || ""} animate-spin`.trim() : className;

    return <IconComponent size={iconSize} className={spinnerClassName} {...props} />;
  }

  // Final fallback: show placeholder with icon name
  const iconSize =
    typeof size === "string" ? (size === "large" ? 32 : size === "small" ? 16 : 24) : size;

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
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="8"
        fill="currentColor"
      >
        {name.substring(0, 2)}
      </text>
    </svg>
  );
};

export const WBIcon: ComponentType<WBIconProps> = Icon;
