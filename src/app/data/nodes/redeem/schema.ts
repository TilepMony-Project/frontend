import { NodeSchema } from '@/types/node-schema';

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
      minimum: 0,
    },
    currency: {
      type: 'string',
      options: currencyOptions,
    },
    recipientWallet: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{40}$',
    },
    conversionRate: {
      type: 'number',
      readOnly: true,
    },
  },
} satisfies NodeSchema;

export type RedeemNodeSchema = typeof schema;
