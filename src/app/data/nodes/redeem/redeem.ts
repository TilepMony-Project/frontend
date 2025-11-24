import { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, RedeemNodeSchema } from './schema';
import { uischema } from './uischema';

export const redeemNode: PaletteItem<RedeemNodeSchema> = {
  label: 'Redeem',
  description: 'Convert stablecoin back to fiat (database simulation)',
  type: 'redeem',
  icon: 'Bank',
  defaultPropertiesData,
  schema,
  uischema,
  templateType: 'Node',
};

