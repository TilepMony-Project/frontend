import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const yieldWithdrawNode: PaletteItem<typeof defaultPropertiesData> = {
  type: "yield-withdraw",
  label: "Yield Withdraw",
  description: "Withdraw tokens from a yield-generating protocol",
  icon: "TrendingDown",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
