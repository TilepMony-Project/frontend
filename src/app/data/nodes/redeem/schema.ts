import type { NodeSchema } from "@/types/node-schema";

export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
  { label: "Dynamic (Previous Output)", value: "DYNAMIC", icon: "ArrowRight" },
];

export const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "IDR", value: "IDR" },
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
      description: "Token to redeem",
    },
    amount: {
      type: "number",
      minimum: 0,
      description: "Amount to redeem (Required if Token is specific)",
    },
    percentageOfInput: {
      type: "number",
      minimum: 1,
      maximum: 10000,
      default: 10000,
    },
    currency: {
      type: "string",
      options: currencyOptions,
      description: "Fiat currency to receive",
    },
  },
} satisfies NodeSchema;

export type RedeemNodeSchema = typeof schema;
