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
          type: "Text",
          label: "Amount to Bridge",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "Enter amount",
        },
        {
          type: "Select",
          label: "Bridge Provider",
          scope: scope("properties.bridgeProvider"),
        },
        {
          type: "Text",
          label: "Source Chain",
          scope: scope("properties.sourceChain"),
          readOnly: true,
        },
        {
          type: "Text",
          label: "Destination Chain",
          scope: scope("properties.destinationChain"),
          readOnly: true,
        },
        {
          type: "Text",
          label: "Receiver Wallet Address",
          scope: scope("properties.receiverWallet"),
          placeholder: "0x...",
        },
        {
          type: "Text",
          label: "Estimated Bridge Time",
          scope: scope("properties.estimatedTime"),
          readOnly: true,
        },
      ],
    },
  ],
};
