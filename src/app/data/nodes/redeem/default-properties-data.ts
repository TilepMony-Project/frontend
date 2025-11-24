import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { RedeemNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<RedeemNodeSchema> = {
  label: 'Redeem',
  description: '',
  amount: 1000,
  currency: 'USD',
  recipientWallet: '',
  conversionRate: 1,
};
