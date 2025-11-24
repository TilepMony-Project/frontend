import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { MintNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<MintNodeSchema> = {
  label: 'Mint',
  description: '',
  amount: 1000,
  issuer: 'DummyIssuerA',
  receivingWallet: '',
  exchangeRate: 1,
};
