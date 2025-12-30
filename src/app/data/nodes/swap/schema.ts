import type { NodeSchema } from "@/types/node-schema";

/**
 * Token options for swap operations
 * Uses actual token symbols that map to deployed contract addresses
 */
export const tokenOptions = [
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "USDC", value: "USDC", icon: "TokenUSDC" },
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
  { label: "Dynamic (Previous Output)", value: "DYNAMIC", icon: "ArrowRight" },
];

/**
 * Swap adapter options - real adapters from deployed contracts
 */
export const swapAdapterOptions = [
  { label: "FusionX", value: "FusionXAdapter", icon: "ExchangeFusionX" },
  { label: "MerchantMoe", value: "MerchantMoeAdapter", icon: "ExchangeMerchantMoe" },
  { label: "Vertex", value: "VertexAdapter", icon: "ExchangeVertex" },
];

export const routeOptions = [
  { label: "Direct", value: "Direct" },
  { label: "Multi-hop", value: "Multi-hop" },
];

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
    inputToken: {
      type: "string",
      options: tokenOptions,
    },
    outputToken: {
      type: "string",
      options: tokenOptions.filter((t) => t.value !== "DYNAMIC"), // Output cannot be dynamic
    },
    percentageOfInput: {
      type: "number",
      minimum: 1,
      maximum: 10000,
      default: 10000,
    },
    swapAdapter: {
      type: "string",
      options: swapAdapterOptions,
    },
  },
} satisfies NodeSchema;

export type SwapNodeSchema = typeof schema;
