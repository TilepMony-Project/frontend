import { NodeSchema } from '@/types/node-schema';

export const yieldModelOptions = [
  { label: 'Conservative 3% APR', value: 'Conservative 3% APR' },
  { label: 'Moderate 5% APR', value: 'Moderate 5% APR' },
  { label: 'Aggressive 8% APR', value: 'Aggressive 8% APR' },
];

export const stopConditionOptions = [
  { label: 'Target amount reached', value: 'targetAmount' },
  { label: 'Time period elapsed', value: 'timePeriod' },
  { label: 'APR drops below threshold', value: 'aprThreshold' },
];

export const autoWithdrawOptions = [
  { label: 'Redeem to fiat', value: 'redeem' },
  { label: 'Transfer to wallet', value: 'transfer' },
  { label: 'Do nothing (manual withdrawal)', value: 'none' },
];

export const timeUnitOptions = [
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
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
    yieldModel: {
      type: 'string',
      options: yieldModelOptions,
    },
    stopCondition: {
      type: 'string',
      options: stopConditionOptions,
    },
    targetAmount: {
      type: 'number',
      minimum: 0,
    },
    timePeriod: {
      type: 'number',
      minimum: 1,
      maximum: 365,
    },
    timeUnit: {
      type: 'string',
      options: timeUnitOptions,
    },
    aprThreshold: {
      type: 'number',
      minimum: 0,
      maximum: 100,
    },
    autoWithdrawDestination: {
      type: 'string',
      options: autoWithdrawOptions,
    },
  },
} satisfies NodeSchema;

export type VaultNodeSchema = typeof schema;

