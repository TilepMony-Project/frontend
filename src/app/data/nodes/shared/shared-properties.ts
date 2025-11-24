import { BaseNodePropertiesSchema } from '@/types/node-schema';

export const sharedProperties: BaseNodePropertiesSchema = {
  label: {
    type: 'string',
  },
  description: {
    type: 'string',
  },
};
