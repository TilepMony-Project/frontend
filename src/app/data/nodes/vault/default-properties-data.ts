import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { VaultNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<VaultNodeSchema> = {
  label: 'Vault',
  description: '',
  amount: 1000,
  yieldModel: 'Moderate 5% APR',
  stopCondition: 'targetAmount',
  targetAmount: 1200,
  timePeriod: 30,
  timeUnit: 'days',
  aprThreshold: 2,
  autoWithdrawDestination: 'redeem',
};

