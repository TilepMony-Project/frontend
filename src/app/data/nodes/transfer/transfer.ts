import { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, TransferNodeSchema } from './schema';
import { uischema } from './uischema';

export const transferNode: PaletteItem<TransferNodeSchema> = {
  label: 'Transfer',
  description: 'Send stablecoins to business wallet or external address',
  type: 'transfer',
  icon: 'PaperPlaneRight',
  defaultPropertiesData,
  schema,
  uischema,
  templateType: 'Node',
};

