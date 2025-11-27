import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { RedeemNodeSchema } from "./schema";

const scope = getScope<RedeemNodeSchema>;

export const uischema: UISchema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Text",
      label: "Label",
      scope: scope("properties.label"),
      readOnly: true,
    },
    {
      type: "TextArea",
      label: "Description",
      scope: scope("properties.description"),
      placeholder: "Optional description for this redeem operation",
    },
    {
      type: "Accordion",
      label: "Redeem Configuration",
      elements: [
        {
          type: "Text",
          label: "Amount to Redeem",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "Enter amount",
        },
        {
          type: "Select",
          label: "Currency Type",
          scope: scope("properties.currency"),
        },
        {
          type: "Text",
          label: "Recipient Wallet Address",
          scope: scope("properties.recipientWallet"),
          placeholder: "0x... (default: current user)",
        },
        {
          type: "Text",
          label: "Conversion Rate",
          scope: scope("properties.conversionRate"),
          readOnly: true,
        },
      ],
    },
  ],
};
