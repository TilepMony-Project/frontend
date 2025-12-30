import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { TransferNodeSchema } from "./schema";

const scope = getScope<TransferNodeSchema>;

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
      placeholder: "Optional description for this transfer",
    },
    {
      type: "Accordion",
      label: "Transfer Configuration",
      elements: [
        {
          type: "Select",
          label: "Token to Transfer",
          scope: scope("properties.token"),
        },
        {
          type: "Text",
          label: "Recipient Address",
          scope: scope("properties.recipientAddress"),
          placeholder: "Leave empty to send to your wallet",
        },
        {
          type: "Text",
          label: "% of Input (Basis Points)",
          scope: scope("properties.percentageOfInput"),
          inputType: "number",
          placeholder: "10000 = 100%",
        },
        {
          type: "TextArea",
          label: "Memo/Note (optional)",
          scope: scope("properties.memo"),
          placeholder: "Add a note (stored in DB only)",
        },
      ],
    },
  ],
};
