import type { PaletteItem } from "@/types/common";
import { defaultPropertiesData } from "./default-properties-data";
import { schema, type WaitNodeSchema } from "./schema";
import { uischema } from "./uischema";

export const waitNode: PaletteItem<WaitNodeSchema> = {
  label: "Wait",
  description: "Delay workflow execution for specified time period",
  type: "wait",
  icon: "Clock",
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
  templateType: "Node",
};
