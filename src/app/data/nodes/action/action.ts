import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { type ActionNodeSchema, schema } from './schema';
import { uischema } from './uischema';

export const action: PaletteItem<ActionNodeSchema> = {
  type: 'action',
  icon: 'PlayCircle',
  label: 'node.action.label',
  description: 'node.action.description',
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
};
