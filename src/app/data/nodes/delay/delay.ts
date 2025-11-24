import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { type DelayNodeSchema, schema } from './schema';
import { uischema } from './uischema';

export const delay: PaletteItem<DelayNodeSchema> = {
  label: 'node.delay.label',
  description: 'node.delay.description',
  type: 'delay',
  icon: 'Timer',
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
};
