import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { TransferNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<TransferNodeSchema> = {
  label: 'Transfer',
  description: '',
  amount: 1000,
  recipientWallet: '',
  network: 'Mantle Testnet',
  maxSlippage: 0.5,
  memo: '',
};

