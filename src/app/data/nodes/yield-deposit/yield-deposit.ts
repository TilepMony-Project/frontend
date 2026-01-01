import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const yieldDepositNode: PaletteItem<typeof defaultPropertiesData> = {
  type: "yield-deposit",
  label: "Yield Deposit",
  description: "Deposit tokens into a yield-generating protocol",
  icon: "TrendingUp",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
