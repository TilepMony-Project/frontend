import type { NodeSchema } from "@/types/node-schema";

export const bridgeProviderOptions = [
  { label: "Hyperlane", value: "Hyperlane", icon: "HyperlaneIcon" },
];

export const destinationChainOptions = [
  { label: "Mantle Sepolia", value: 5003, icon: "MantleLogo" },
  { label: "Base Sepolia", value: 84532, icon: "BaseLogo" },
];

export const bridgeTokenOptions = [
  { label: "DYNAMIC (from previous step)", value: "DYNAMIC" },
  { label: "IDRX", value: "IDRX" },
  { label: "USDC", value: "USDC" },
  { label: "USDT", value: "USDT" },
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
      options: bridgeTokenOptions,
    },
    bridgeProvider: {
      type: "string",
      options: bridgeProviderOptions,
      readOnly: true,
    },
    destinationChain: {
      type: "number",
      options: destinationChainOptions,
    },
    inputAmountPercentage: {
      type: "number",
      minimum: 1,
      maximum: 10000,
    },
    // Auto-set to MainController address (CREATE2: same across chains)
    recipientAddress: {
      type: "string",
      readOnly: true,
    },
  },
} satisfies NodeSchema;

export type BridgeNodeSchema = typeof schema;
