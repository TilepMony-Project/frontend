import type { PaletteItem } from "@/types/common";
import { defaultPropertiesData } from "./default-properties-data";
import { schema, type SwapNodeSchema } from "./schema";
import { uischema } from "./uischema";

export const swapNode: PaletteItem<SwapNodeSchema> = {
  label: "Swap",
  description: "Exchange one token for another via dummy DEX",
  type: "swap",
  icon: "ArrowLeftRight",
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
  templateType: "Node",
};
