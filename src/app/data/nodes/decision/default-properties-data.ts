import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { DecisionNodeSchema } from './schema';
import { statusOptions } from '../shared/general-information';

export const defaultPropertiesData: NodeDataProperties<DecisionNodeSchema> = {
  status: statusOptions.active.value,
  decisionBranches: [],
};
