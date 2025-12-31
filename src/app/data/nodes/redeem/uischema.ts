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
          type: "Select",
          label: "Token to Redeem",
          scope: scope("properties.token"),
        },
        {
          type: "Text",
          label: "Amount to Redeem (if specific)",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "e.g. 100",
          rule: {
            effect: "SHOW",
            condition: {
              scope: scope("properties.token"),
              schema: { not: { const: "DYNAMIC" } },
            },
          },
        },
        {
          type: "Text",
          label: "% of Input (Basis Points)",
          scope: scope("properties.percentageOfInput"),
          inputType: "number",
          placeholder: "10000 = 100%",
          rule: {
            effect: "SHOW",
            condition: {
              scope: scope("properties.token"),
              schema: { const: "DYNAMIC" },
            },
          },
        },
        {
          type: "Select",
          label: "Receive Currency (Fiat)",
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
