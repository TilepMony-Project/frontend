import type { PaletteItem } from "@/types/common";

type NodesDefinitionsBySubType = {
  [subType: string]: PaletteItem;
};

export function getNodesDefinitionsByType(palette: PaletteItem[]): NodesDefinitionsBySubType {
  return palette.reduce<NodesDefinitionsBySubType>((stack, item) => {
    stack[item.type] = item;

    return stack;
  }, {} as NodesDefinitionsBySubType);
}
