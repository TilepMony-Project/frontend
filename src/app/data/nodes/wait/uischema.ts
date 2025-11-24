import { UISchema } from '@/features/json-form/types/uischema';
import { getScope } from '@/features/json-form/utils/get-scope';
import { WaitNodeSchema } from './schema';

const scope = getScope<WaitNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Text',
      label: 'Label',
      scope: scope('properties.label'),
    },
    {
      type: 'TextArea',
      label: 'Description',
      scope: scope('properties.description'),
      placeholder: 'Optional description for this wait period',
    },
    {
      type: 'Accordion',
      label: 'Wait Configuration',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Text',
              label: 'Delay Duration',
              scope: scope('properties.delayDuration'),
              inputType: 'number',
              placeholder: 'Enter duration',
            },
            {
              type: 'Select',
              label: 'Time Unit',
              scope: scope('properties.timeUnit'),
            },
          ],
        },
        {
          type: 'TextArea',
          label: 'Description/Reason (optional)',
          scope: scope('properties.reason'),
          placeholder: 'Why is this wait period needed?',
        },
      ],
    },
  ],
};

