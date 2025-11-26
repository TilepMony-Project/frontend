import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { WaitNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<WaitNodeSchema> = {
  label: "Wait",
  description: "",
  delayDuration: 1,
  timeUnit: "hours",
  reason: "",
};
