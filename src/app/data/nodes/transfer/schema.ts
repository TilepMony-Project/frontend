import type { NodeSchema } from "@/types/node-schema";

/**
 * Token options for transfer operations
 */
export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
  { label: "Dynamic (Previous Output)", value: "DYNAMIC", icon: "ArrowRight" },
];

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
    token: {
      type: "string",
      options: tokenOptions,
    },
    recipientAddress: {
      type: "string",
      pattern: "^0x[a-fA-F0-9]{40}$",
    },
    amount: {
      type: "number",
      minimum: 0,
      description: "Amount to transfer (Required if Token is specific)",
    },
    percentageOfInput: {
      type: "number",
      minimum: 1,
      maximum: 10000,
      default: 10000,
    },
    memo: {
      type: "string",
    },
  },
} satisfies NodeSchema;

export type TransferNodeSchema = typeof schema;
