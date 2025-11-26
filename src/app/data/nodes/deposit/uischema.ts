import type { UISchema } from '@/features/json-form/types/uischema';
import { getScope } from '@/features/json-form/utils/get-scope';
import type { DepositNodeSchema } from './schema';

const scope = getScope<DepositNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Text',
      label: 'Label',
      scope: scope('properties.label'),
      readOnly: true,
    },
    {
      type: 'TextArea',
      label: 'Description',
      scope: scope('properties.description'),
      placeholder: 'Optional description for this deposit',
    },
    {
      type: 'Accordion',
      label: 'Deposit Configuration',
      elements: [
        {
          type: 'HorizontalLayout',
          layoutColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          elements: [
            {
              type: 'Text',
              label: 'Amount',
              scope: scope('properties.amount'),
              inputType: 'number',
              placeholder: '100 - 100,000,000',
            },
            {
              type: 'Select',
              label: 'Currency',
              scope: scope('properties.currency'),
            },
          ],
        },
        {
          type: 'Select',
          label: 'Payment Gateway',
          scope: scope('properties.paymentGateway'),
        },
      ],
    },
  ],
};
