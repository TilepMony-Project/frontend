import type { UISchema } from '@/features/json-form/types/uischema';
import { getScope } from '@/features/json-form/utils/get-scope';
import type { DecisionNodeSchema } from './schema';

const scope = getScope<DecisionNodeSchema>;

const generalInformation: UISchema = {
  type: 'Accordion',
  label: 'General Settings',
  elements: [
    {
      type: 'Text',
      scope: scope('properties.label' as any),
      label: 'Title',
      placeholder: 'Node Title...',
    },
    {
      type: 'Text',
      scope: scope('properties.description' as any),
      label: 'Description',
      placeholder: 'Type your description here...',
    },
    {
      type: 'Select',
      scope: scope('properties.status'),
      label: 'Status',
    },
  ],
} as const;

const decisionSettings: UISchema = {
  type: 'Accordion',
  label: 'Decision Settings',
  elements: [
    {
      type: 'DecisionBranches',
      scope: scope('properties.decisionBranches'),
    },
  ],
} as const;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [generalInformation, decisionSettings],
};
