import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema, type MintNodeSchema } from "./schema";
import { uischema } from "./uischema";

export const mintNode: PaletteItem<MintNodeSchema> = {
  label: "Mint",
  description: "Convert fiat to stablecoin via dummy issuer",
  type: "mint",
  icon: "Coins",
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
  templateType: NodeType.Node,
};
