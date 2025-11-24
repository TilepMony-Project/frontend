import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, type PartitionNodeSchema } from './schema';
import { uischema } from './uischema';

export const partitionNode: PaletteItem<PartitionNodeSchema> = {
  label: 'Partition',
  description: 'Split incoming amount into multiple branches with percentage allocation',
  type: 'partition',
  icon: 'GitBranch',
  defaultPropertiesData,
  schema,
  uischema,
  templateType: 'Node',
};
