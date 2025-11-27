import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const vaultNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Vault",
  description: "Deposit into yield-generating vault with automated stop conditions",
  type: "vault",
  icon: "ShieldCheck",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
