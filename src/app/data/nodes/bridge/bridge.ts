import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const bridgeNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Bridge",
  description: "Cross-chain token transfer via Hyperlane",
  type: "bridge",
  icon: "Link2",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
