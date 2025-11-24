import { paletteData } from '@/data/palette';
import { getNodesDefinitionsByType } from './get-nodes-definitions-by-type';
import type { WorkflowBuilderNode } from '@/types/node-data';
import type { PaletteItem } from '@/types/common';

const nodesDefinitionsByType = getNodesDefinitionsByType(paletteData);

export function getNodeDefinition(node?: WorkflowBuilderNode): PaletteItem | undefined {
  const dataType = node?.data?.type || '';

  return nodesDefinitionsByType[dataType];
}
