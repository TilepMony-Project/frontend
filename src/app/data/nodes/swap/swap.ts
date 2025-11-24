import { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, SwapNodeSchema } from './schema';
import { uischema } from './uischema';

export const swapNode: PaletteItem<SwapNodeSchema> = {
  label: 'Swap',
  description: 'Exchange one token for another via dummy DEX',
  type: 'swap',
  icon: 'ArrowsClockwise',
  defaultPropertiesData,
  schema,
  uischema,
  templateType: 'Node',
};
