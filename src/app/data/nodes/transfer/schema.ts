import type { NodeSchema } from '@/types/node-schema';

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
    recipientWallet: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{40}$',
    },
    network: {
      type: 'string',
      readOnly: true,
    },
    maxSlippage: {
      type: 'number',
      minimum: 0.1,
      maximum: 2,
    },
    memo: {
      type: 'string',
    },
  },
} satisfies NodeSchema;

export type TransferNodeSchema = typeof schema;

