import type { PaletteItem } from '@/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, type VaultNodeSchema } from './schema';
import { uischema } from './uischema';

export const vaultNode: PaletteItem<VaultNodeSchema> = {
  label: 'Vault',
  description: 'Deposit into yield-generating vault with automated stop conditions',
  type: 'vault',
  icon: 'ShieldCheck',
  defaultPropertiesData: defaultPropertiesData as any,
  schema,
  uischema,
  templateType: 'Node',
};
