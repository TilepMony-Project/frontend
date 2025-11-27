import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const redeemNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Redeem",
  description: "Convert stablecoin back to fiat (database simulation)",
  type: "redeem",
  icon: "Building2",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
