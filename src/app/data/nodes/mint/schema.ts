import type { NodeSchema } from "@/types/node-schema";

/**
 * Token options for minting
 * These are the stablecoins that can be minted from user's fiat balance
 */
export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
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
    amount: {
      type: "number",
      minimum: 1,
    },
    currentBalanceText: {
      type: "string",
    },
    projectedBalanceText: {
      type: "string",
    },
  },
} satisfies NodeSchema;

export type MintNodeSchema = typeof schema;
