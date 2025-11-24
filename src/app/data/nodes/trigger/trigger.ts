import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, type TriggerNodeSchema } from './schema';
import { uischema } from './uischema';

export const triggerNode: PaletteItem<TriggerNodeSchema> = {
  label: 'node.trigger.label',
  description: 'node.trigger.description',
  type: 'trigger',
  icon: 'Lightning',
  defaultPropertiesData,
  schema,
  uischema,
};
