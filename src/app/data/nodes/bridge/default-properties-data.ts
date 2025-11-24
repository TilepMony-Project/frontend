import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { BridgeNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<BridgeNodeSchema> = {
  label: 'Bridge',
  description: '',
  amount: 1000,
  bridgeProvider: 'DummyLayerZero',
  sourceChain: 'Ethereum Testnet',
  destinationChain: 'Mantle Testnet',
  receiverWallet: '',
  estimatedTime: '~30 seconds',
};
