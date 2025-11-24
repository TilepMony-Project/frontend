import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { ConditionalNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<ConditionalNodeSchema> = {
  label: 'node.conditional.label',
  description: 'node.conditional.description',
  conditionsArray: [],
};
