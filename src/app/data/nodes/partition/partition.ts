import type { PaletteItem } from "@/types/common";
import { NodeType } from "@/types/node-types";
import { defaultPropertiesData } from "./default-properties-data";
import { schema } from "./schema";
import { uischema } from "./uischema";

export const partitionNode: PaletteItem<typeof defaultPropertiesData> = {
  label: "Partition",
  description: "Split funds into multiple streams by percentage",
  type: "partition",
  icon: "GitBranch",
  defaultPropertiesData,
  schema,
  uischema,
  templateType: NodeType.Node,
};
