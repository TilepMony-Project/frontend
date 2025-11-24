import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, type BridgeNodeSchema } from './schema';
import { uischema } from './uischema';

export const bridgeNode: PaletteItem<BridgeNodeSchema> = {
  label: 'Bridge',
  description: 'Transfer tokens to Mantle testnet from simulated source chain',
  type: 'bridge',
  icon: 'Bridge',
  defaultPropertiesData,
  schema,
  uischema,
  templateType: 'Node',
};
