import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const scheduleNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Schedule",
  description: "Schedule workflow execution with intervals, cron, or loop count",
  type: "schedule",
  icon: "RefreshCw",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
