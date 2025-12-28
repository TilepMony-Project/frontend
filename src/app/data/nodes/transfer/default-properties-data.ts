import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { TransferNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<TransferNodeSchema> = {
  label: "Transfer",
  description: "",
  token: "DYNAMIC", // Use previous output by default
  recipientAddress: "",
  percentageOfInput: 10000, // 100% in basis points
  memo: "",
};
