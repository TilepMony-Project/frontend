import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { type DecisionNodeSchema, schema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@/types/node-types';

export const decision: PaletteItem<DecisionNodeSchema> = {
  label: 'node.decision.label',
  description: 'node.decision.description',
  type: 'decision',
  icon: 'ArrowsSplit',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};
