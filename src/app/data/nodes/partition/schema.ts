import { NodeSchema } from '@/types/node-schema';

export const numberOfBranchesOptions = [
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

export const schema = {
  properties: {
    label: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    numberOfBranches: {
      type: 'number',
      minimum: 2,
      maximum: 5,
    },
    branches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          percentage: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
          label: {
            type: 'string',
          },
        },
      },
    },
    autoBalance: {
      type: 'boolean',
    },
  },
} satisfies NodeSchema;

export type PartitionNodeSchema = typeof schema;
