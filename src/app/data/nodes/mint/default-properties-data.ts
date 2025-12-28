import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { MintNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<MintNodeSchema> = {
  label: "Mint",
  description: "",
  token: "IDRX",
  amount: 1000000, // 1 million IDRX (common for IDR-pegged tokens)
};
