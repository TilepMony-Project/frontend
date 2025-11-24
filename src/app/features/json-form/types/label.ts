import type { LabelProps } from '@/components/form/label/label';
import type { Override } from './utils';
import type { LabelElement as BaseLabelElement } from '@jsonforms/core';

export type LabelElement = Override<BaseLabelElement, Omit<LabelProps, 'label'>>;
