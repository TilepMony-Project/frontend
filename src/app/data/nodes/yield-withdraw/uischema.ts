import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { YieldWithdrawNodeSchema } from "./schema";

const scope = getScope<YieldWithdrawNodeSchema>;

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
      placeholder: "Optional description for this withdrawal",
    },
    {
      type: "Accordion",
      label: "Withdraw Configuration",
      elements: [
        {
          type: "Select",
          label: "Share Token (Vault Token)",
          scope: scope("properties.shareToken"),
        },
        {
          type: "Select",
          label: "Underlying Token (Receive)",
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
