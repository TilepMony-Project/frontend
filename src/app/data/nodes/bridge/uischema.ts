import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { BridgeNodeSchema } from "./schema";

const scope = getScope<BridgeNodeSchema>;

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
      placeholder: "Optional description for this bridge operation",
    },
    {
      type: "Accordion",
      label: "Bridge Configuration",
      elements: [
        {
          type: "Select",
          label: "Token to Bridge",
          scope: scope("properties.token"),
        },
        {
          type: "Select",
          label: "Destination Chain",
          scope: scope("properties.destinationChain"),
        },
        {
          type: "Text",
          label: "Input Amount Percentage (Basis Points)",
          scope: scope("properties.inputAmountPercentage"),
          inputType: "number",
          placeholder: "10000 = 100%",
        },
        {
          type: "Text",
          label: "Bridge Provider",
          scope: scope("properties.bridgeProvider"),
          readOnly: true,
        },
        {
          type: "Text",
          label: "Recipient Address (MainController)",
          scope: scope("properties.recipientAddress"),
          readOnly: true,
        },
      ],
    },
  ],
};
