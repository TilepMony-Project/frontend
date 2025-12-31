import type { NodeSchema } from "@/types/node-schema";

/**
 * Token options for yield withdraw operations
 */
export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
];

/**
 * Share token options - vault tokens received from deposits
 */
export const shareTokenOptions = [
  { label: "Dynamic (Previous Output)", value: "DYNAMIC", icon: "ArrowRight" },
  { label: "mlIDRX (MethLab IDRX)", value: "mlIDRX", icon: "VaultMethLab" },
  { label: "mlUSDC (MethLab USDC)", value: "mlUSDC", icon: "VaultMethLab" },
  { label: "mlUSDT (MethLab USDT)", value: "mlUSDT", icon: "VaultMethLab" },
  { label: "inIDRX (InitCapital IDRX)", value: "inIDRX", icon: "VaultInitCapital" },
  { label: "inUSDC (InitCapital USDC)", value: "inUSDC", icon: "VaultInitCapital" },
  { label: "inUSDT (InitCapital USDT)", value: "inUSDT", icon: "VaultInitCapital" },
];

/**
 * Yield adapter options
 */
export const yieldAdapterOptions = [
  { label: "MethLab", value: "MethLabAdapter", icon: "VaultMethLab" },
  { label: "InitCapital", value: "InitCapitalAdapter", icon: "VaultInitCapital" },
];

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
    shareToken: {
      type: "string",
      options: shareTokenOptions,
    },
    underlyingToken: {
      type: "string",
      options: tokenOptions,
    },
    yieldAdapter: {
      type: "string",
      options: yieldAdapterOptions,
    },
    percentageOfInput: {
      type: "number",
      minimum: 1,
      maximum: 10000,
      default: 10000,
    },
  },
} satisfies NodeSchema;

export type YieldWithdrawNodeSchema = typeof schema;
