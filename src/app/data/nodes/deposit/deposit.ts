import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const depositNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Deposit",
  description: "Simulates receiving fiat funding from corporate client or treasury",
  type: "deposit",
  icon: "DollarSign",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
