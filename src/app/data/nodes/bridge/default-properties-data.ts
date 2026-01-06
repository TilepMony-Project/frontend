import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { BridgeNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<BridgeNodeSchema> = {
  label: "Bridge",
  description: "Cross-chain token bridge via Hyperlane",
  token: "DYNAMIC",
  bridgeProvider: "Hyperlane",
  destinationChain: 84532, // Default: Base Sepolia
  inputAmountPercentage: 10000, // 100%
  recipientAddress: "0xFE16617562Ce4005C42B0CDd70493820Ff0d8494", // MainController (CREATE2: same across chains)
};
