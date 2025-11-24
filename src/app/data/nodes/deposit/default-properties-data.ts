import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { DepositNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<DepositNodeSchema> = {
  label: 'Deposit',
  description: '',
  amount: 1000,
  currency: 'USD',
  paymentGateway: 'DummyGatewayA',
};
