import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { YieldDepositNodeSchema } from "./schema";

const scope = getScope<YieldDepositNodeSchema>;

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
      placeholder: "Optional description for this deposit",
    },
    {
      type: "Accordion",
      label: "Deposit Configuration",
      elements: [
        {
          type: "Select",
          label: "Underlying Token",
          scope: scope("properties.underlyingToken"),
        },
        {
          type: "Select",
          label: "Yield Protocol",
          scope: scope("properties.yieldAdapter"),
        },
        {
          type: "Text",
          label: "% of Input (Basis Points)",
          scope: scope("properties.percentageOfInput"),
          inputType: "number",
          placeholder: "10000 = 100%",
        },
      ],
    },
  ],
};
