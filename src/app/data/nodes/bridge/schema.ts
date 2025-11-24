import { NodeSchema } from '@/types/node-schema';

export const bridgeProviderOptions = [
  { label: 'DummyLayerZero', value: 'DummyLayerZero' },
  { label: 'DummyOrbiter', value: 'DummyOrbiter' },
  { label: 'DummyHyperlane', value: 'DummyHyperlane' },
];

export const schema = {
  properties: {
    label: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    amount: {
      type: 'number',
      minimum: 0,
    },
    bridgeProvider: {
      type: 'string',
      options: bridgeProviderOptions,
    },
    sourceChain: {
      type: 'string',
      readOnly: true,
    },
    destinationChain: {
      type: 'string',
      readOnly: true,
    },
    receiverWallet: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{40}$',
    },
    estimatedTime: {
      type: 'string',
      readOnly: true,
    },
  },
} satisfies NodeSchema;

export type BridgeNodeSchema = typeof schema;
