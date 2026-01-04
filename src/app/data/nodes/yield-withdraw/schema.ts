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
  { label: "mlIDRX (MethLab IDRX)", value: "mlIDRX", icon: "MethLabIcon" },
  { label: "mlUSDC (MethLab USDC)", value: "mlUSDC", icon: "MethLabIcon" },
  { label: "mlUSDT (MethLab USDT)", value: "mlUSDT", icon: "MethLabIcon" },
  {
    label: "inIDRX (InitCapital IDRX)",
    value: "inIDRX",
    icon: "InitCapitalIcon",
  },
  {
    label: "inUSDC (InitCapital USDC)",
    value: "inUSDC",
    icon: "InitCapitalIcon",
  },
  {
    label: "inUSDT (InitCapital USDT)",
    value: "inUSDT",
    icon: "InitCapitalIcon",
  },
  { label: "cIDRXv3 (Compound IDRX)", value: "cIDRXv3", icon: "CompoundIcon" },
  { label: "cUSDCv3 (Compound USDC)", value: "cUSDCv3", icon: "CompoundIcon" },
  { label: "cUSDTv3 (Compound USDT)", value: "cUSDTv3", icon: "CompoundIcon" },
];

/**
 * Yield adapter options
 */
export const yieldAdapterOptions = [
  { label: "MethLab", value: "MethLabAdapter", icon: "MethLabIcon" },
  {
    label: "InitCapital",
    value: "InitCapitalAdapter",
    icon: "InitCapitalIcon",
  },
  { label: "Compound", value: "CompoundAdapter", icon: "CompoundIcon" },
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
    amount: {
      type: "number",
      minimum: 0,
      description: "Amount to withdraw (Required if Share Token is specific)",
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
