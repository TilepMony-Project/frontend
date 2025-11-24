import { UISchema } from '@/features/json-form/types/uischema';
import { getScope } from '@/features/json-form/utils/get-scope';
import { MintNodeSchema } from './schema';

const scope = getScope<MintNodeSchema>;

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
      placeholder: 'Optional description for this mint operation',
    },
    {
      type: 'Accordion',
      label: 'Mint Configuration',
      elements: [
        {
          type: 'Text',
          label: 'Amount to Mint',
          scope: scope('properties.amount'),
          inputType: 'number',
          placeholder: 'Enter amount',
        },
        {
          type: 'Select',
          label: 'Stablecoin Issuer',
          scope: scope('properties.issuer'),
        },
        {
          type: 'Text',
          label: 'Receiving Wallet Address',
          scope: scope('properties.receivingWallet'),
          placeholder: '0x...',
        },
        {
          type: 'Text',
          label: 'Exchange Rate',
          scope: scope('properties.exchangeRate'),
          readOnly: true,
        },
      ],
    },
  ],
};

