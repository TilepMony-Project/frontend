import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { PartitionNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<PartitionNodeSchema> = {
  label: 'Partition',
  description: '',
  numberOfBranches: 2,
  branches: [
    { percentage: 50, label: 'Branch 1' },
    { percentage: 50, label: 'Branch 2' },
  ],
  autoBalance: true,
};

