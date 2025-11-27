import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const waitNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Wait",
  description: "Delay workflow execution for specified time period",
  type: "wait",
  icon: "Clock",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
