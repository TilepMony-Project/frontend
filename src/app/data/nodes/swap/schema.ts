import type { NodeSchema } from '@/types/node-schema';

export const tokenOptions = [
  { label: 'USDT', value: 'USDT' },
  { label: 'USDX', value: 'USDX' },
  { label: 'IDRX', value: 'IDRX' },
  { label: 'mUSDT', value: 'mUSDT' },
];

export const swapProviderOptions = [
  { label: 'DummyDEXA', value: 'DummyDEXA' },
  { label: 'DummyDEXB', value: 'DummyDEXB' },
  { label: 'DummyDEXC', value: 'DummyDEXC' },
];

export const routeOptions = [
  { label: 'Direct', value: 'Direct' },
  { label: 'Multi-hop', value: 'Multi-hop' },
];

export const schema = {
  properties: {
    label: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    inputToken: {
      type: 'string',
      options: tokenOptions,
    },
    outputToken: {
      type: 'string',
      options: tokenOptions,
    },
    amount: {
      type: 'number',
      minimum: 0,
    },
    swapProvider: {
      type: 'string',
      options: swapProviderOptions,
    },
    slippageTolerance: {
      type: 'number',
      minimum: 0.1,
      maximum: 5,
    },
    preferredRoute: {
      type: 'string',
      options: routeOptions,
    },
  },
} satisfies NodeSchema;

export type SwapNodeSchema = typeof schema;
