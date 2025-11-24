import { uischema } from './uischema';
import { defaultPropertiesData } from './default-properties-data';
import { type ConditionalNodeSchema, schema } from './schema';
import type { PaletteItem } from '@/types/common';

export const conditional: PaletteItem<ConditionalNodeSchema> = {
  label: 'node.conditional.label',
  description: 'node.conditional.description',
  type: 'conditional',
  icon: 'ListChecks',
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
};
