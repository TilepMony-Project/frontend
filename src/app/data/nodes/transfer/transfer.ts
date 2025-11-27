import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const transferNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Transfer",
  description: "Send stablecoins to business wallet or external address",
  type: "transfer",
  icon: "Send",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
