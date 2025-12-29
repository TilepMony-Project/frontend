import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { MintNodeSchema } from "./schema";

const scope = getScope<MintNodeSchema>;

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
      placeholder: "Optional description for this mint operation",
    },
    {
      type: "Accordion",
      label: "Mint Configuration",
      elements: [
        {
          type: "Select",
          label: "Token to Mint",
          scope: scope("properties.token"),
        },
        {
          type: "Text",
          label: "Amount to Mint",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "Enter amount",
        },
        {
          type: "Text",
          scope: scope("properties.currentBalanceText"),
          options: { readonly: true },
        },
        {
          type: "Text",
          scope: scope("properties.projectedBalanceText"),
          options: { readonly: true },
        },
      ],
    },
  ],
};
