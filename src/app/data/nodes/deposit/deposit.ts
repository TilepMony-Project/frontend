import type { PaletteItem } from "@/types/common";
import { defaultPropertiesData } from "./default-properties-data";
import { schema, type DepositNodeSchema } from "./schema";
import { uischema } from "./uischema";

export const depositNode: PaletteItem<DepositNodeSchema> = {
  label: "Deposit",
  description: "Simulates receiving fiat funding from corporate client or treasury",
  type: "deposit",
  icon: "DollarSign",
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
  templateType: "Node",
};
