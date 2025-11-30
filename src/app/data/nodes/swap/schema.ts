import type { NodeSchema } from "@/types/node-schema";

export const tokenOptions = [
  { label: "USDT", value: "USDT", icon: "TokenUSDT" },
  { label: "USDX", value: "USDX", icon: "TokenUSDC" },
  { label: "IDRX", value: "IDRX", icon: "TokenIDRX" },
  { label: "mUSDT", value: "mUSDT", icon: "TokenUSDT" },
];

export const swapProviderOptions = [
  { label: "Uniswap", value: "DummyDEXA", icon: "ProtocolUniswap" },
  { label: "1INCH", value: "DummyDEXB", icon: "Protocol1INCH" },
  { label: "Curve", value: "DummyDEXC", icon: "ProtocolCurve" },
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
      options: tokenOptions,
    },
    amount: {
      type: "number",
      minimum: 0,
    },
    swapProvider: {
      type: "string",
      options: swapProviderOptions,
    },
    slippageTolerance: {
      type: "number",
      minimum: 0.1,
      maximum: 5,
    },
    preferredRoute: {
      type: "string",
      options: routeOptions,
    },
  },
} satisfies NodeSchema;

export type SwapNodeSchema = typeof schema;
