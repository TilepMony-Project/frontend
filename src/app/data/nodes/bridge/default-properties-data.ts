import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { BridgeNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<BridgeNodeSchema> = {
  label: "Bridge",
  description: "",
  amount: 1000,
  bridgeProvider: "DummyLayerZero",
  sourceChain: "Ethereum Testnet",
  destinationChain: "Mantle Testnet",
  receiverWallet: "",
  estimatedTime: "~30 seconds",
};
