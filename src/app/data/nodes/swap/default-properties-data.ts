import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { SwapNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<SwapNodeSchema> = {
  label: "Swap",
  description: "",
  inputToken: "IDRX",
  outputToken: "USDC",
  percentageOfInput: 10000, // 100% in basis points
  swapAdapter: "FusionXAdapter",
  slippageTolerance: 0.5,
  preferredRoute: "Direct",
};
