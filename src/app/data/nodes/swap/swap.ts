import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const swapNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Swap",
  description: "Exchange one token for another via dummy DEX",
  type: "swap",
  icon: "ArrowLeftRight",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
