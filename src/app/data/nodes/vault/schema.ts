import type { NodeSchema } from "@/types/node-schema";

/**
 * Token options for yield operations
 */
export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
  { label: "Dynamic (Previous Output)", value: "DYNAMIC", icon: "ArrowRight" },
];

/**
 * Yield adapter options - real adapters from deployed contracts
 */
export const yieldAdapterOptions = [
  { label: "MethLab", value: "MethLabAdapter", icon: "VaultMethLab" },
  { label: "InitCapital", value: "InitCapitalAdapter", icon: "VaultInitCapital" },
  { label: "Compound (IDRX)", value: "CompoundAdapterIDRX", icon: "VaultCompound" },
  { label: "Compound (USDC)", value: "CompoundAdapterUSDC", icon: "VaultCompound" },
  { label: "Compound (USDT)", value: "CompoundAdapterUSDT", icon: "VaultCompound" },
];

export const stopConditionOptions = [
  { label: "Target amount reached", value: "targetAmount" },
  { label: "Time period elapsed", value: "timePeriod" },
  { label: "APR drops below threshold", value: "aprThreshold" },
];

export const autoWithdrawOptions = [
  { label: "Redeem to fiat", value: "redeem" },
  { label: "Transfer to wallet", value: "transfer" },
  { label: "Do nothing (manual withdrawal)", value: "none" },
];

export const timeUnitOptions = [
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
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
    percentageOfInput: {
      type: "number",
      minimum: 1,
      maximum: 10000,
      default: 10000,
    },
    stopCondition: {
      type: "string",
      options: stopConditionOptions,
    },
    targetAmount: {
      type: "number",
      minimum: 0,
    },
    timePeriod: {
      type: "number",
      minimum: 1,
      maximum: 365,
    },
    timeUnit: {
      type: "string",
      options: timeUnitOptions,
    },
    aprThreshold: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    autoWithdrawDestination: {
      type: "string",
      options: autoWithdrawOptions,
    },
  },
} satisfies NodeSchema;

export type VaultNodeSchema = typeof schema;
