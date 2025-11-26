import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema, type RedeemNodeSchema } from "./schema";
import { uischema } from "./uischema";

export const redeemNode: PaletteItem<RedeemNodeSchema> = {
  label: "Redeem",
  description: "Convert stablecoin back to fiat (database simulation)",
  type: "redeem",
  icon: "Building2",
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
  templateType: NodeType.Node,
};
