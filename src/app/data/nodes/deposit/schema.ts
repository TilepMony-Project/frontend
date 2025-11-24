import { NodeSchema } from '@/types/node-schema';

export const paymentGatewayOptions = [
  { label: 'DummyGatewayA', value: 'DummyGatewayA' },
  { label: 'DummyGatewayB', value: 'DummyGatewayB' },
  { label: 'DummyGatewayC', value: 'DummyGatewayC' },
];

export const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'IDR', value: 'IDR' },
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
      minimum: 100,
      maximum: 100000000,
    },
    currency: {
      type: 'string',
      options: currencyOptions,
    },
    paymentGateway: {
      type: 'string',
      options: paymentGatewayOptions,
    },
  },
} satisfies NodeSchema;

export type DepositNodeSchema = typeof schema;

