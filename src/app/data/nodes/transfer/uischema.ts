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
          type: "Text",
          label: "Amount to Transfer",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "Enter amount",
        },
        {
          type: "Text",
          label: "Recipient Wallet Address",
          scope: scope("properties.recipientWallet"),
          placeholder: "0x... (default: current user)",
        },
        {
          type: "Text",
          label: "Gas Fee Estimate",
          scope: scope("properties.gasFee"),
          readOnly: true,
        },
        {
          type: "Text",
          label: "Network",
          scope: scope("properties.network"),
          readOnly: true,
        },
        {
          type: "Text",
          label: "Max Slippage (%)",
          scope: scope("properties.maxSlippage"),
          inputType: "number",
          placeholder: "0.1 - 2",
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
