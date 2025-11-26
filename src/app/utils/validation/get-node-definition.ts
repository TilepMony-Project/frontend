import { paletteData } from "@/data/palette";
import { getNodesDefinitionsByType } from "./get-nodes-definitions-by-type";
import type { WorkflowBuilderNode } from "@/types/node-data";
import type { PaletteItem } from "@/types/common";

const nodesDefinitionsByType: Record<string, PaletteItem> = getNodesDefinitionsByType(paletteData);

export function getNodeDefinition(node?: WorkflowBuilderNode): PaletteItem | undefined {
  const nodeData = node?.data;
  const dataType = typeof nodeData?.type === "string" ? (nodeData.type as string) : "";

  return dataType ? nodesDefinitionsByType[dataType] : undefined;
}
