import type { NodeSchema } from "@/types/node-schema";

/**
 * Token options for yield deposit operations
 */
export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
  { label: "Dynamic (Previous Output)", value: "DYNAMIC", icon: "ArrowRight" },
];

/**
 * Yield adapter options
 */
export const yieldAdapterOptions = [
  { label: "MethLab", value: "MethLabAdapter", icon: "ShieldCheck" },
  { label: "InitCapital", value: "InitCapitalAdapter", icon: "Building2" },
  { label: "Compound", value: "CompoundAdapter", icon: "Building2" },
];

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
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
      description: "Amount to deposit (Required if Token is specific)",
    },
    percentageOfInput: {
      type: "number",
      minimum: 1,
      maximum: 10000,
      default: 10000,
    },
  },
} satisfies NodeSchema;

export type YieldDepositNodeSchema = typeof schema;
