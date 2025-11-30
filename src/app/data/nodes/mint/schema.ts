import type { NodeSchema } from "@/types/node-schema";

export const issuerOptions = [
  { label: "DummyIssuerA", value: "DummyIssuerA", icon: "TokenUSDT" },
  { label: "DummyIssuerB", value: "DummyIssuerB", icon: "TokenUSDC" },
  { label: "DummyIssuerC", value: "DummyIssuerC", icon: "TokenDAI" },
];

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
    amount: {
      type: "number",
      minimum: 0,
    },
    issuer: {
      type: "string",
      options: issuerOptions,
    },
    receivingWallet: {
      type: "string",
      pattern: "^0x[a-fA-F0-9]{40}$",
    },
    exchangeRate: {
      type: "number",
      readOnly: true,
    },
  },
} satisfies NodeSchema;

export type MintNodeSchema = typeof schema;
