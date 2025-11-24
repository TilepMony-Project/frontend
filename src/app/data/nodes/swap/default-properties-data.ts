import type { NodeDataProperties } from '@/features/json-form/types/default-properties';
import type { SwapNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<SwapNodeSchema> = {
  label: 'Swap',
  description: '',
  inputToken: 'IDRX',
  outputToken: 'USDT',
  amount: 1000,
  swapProvider: 'DummyDEXA',
  slippageTolerance: 0.5,
  preferredRoute: 'Direct',
};
