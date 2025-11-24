import { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, MintNodeSchema } from './schema';
import { uischema } from './uischema';

export const mintNode: PaletteItem<MintNodeSchema> = {
  label: 'Mint',
  description: 'Convert fiat to stablecoin via dummy issuer',
  type: 'mint',
  icon: 'Coins',
  defaultPropertiesData,
  schema,
  uischema,
  templateType: 'Node',
};
