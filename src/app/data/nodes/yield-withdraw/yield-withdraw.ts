import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { schema } from "./schema";
import { uischema } from "./uischema";
import { defaultPropertiesData } from "./default-properties-data";

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
