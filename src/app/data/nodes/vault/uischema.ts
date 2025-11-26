import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { VaultNodeSchema } from "./schema";

const scope = getScope<VaultNodeSchema>;

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
      placeholder: "Optional description for this vault deposit",
    },
    {
      type: "Accordion",
      label: "Vault Configuration",
      elements: [
        {
          type: "Text",
          label: "Amount to Deposit",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "Enter amount",
        },
        {
          type: "Select",
          label: "Yield Model",
          scope: scope("properties.yieldModel"),
        },
        {
          type: "Select",
          label: "Vault Stop Condition",
          scope: scope("properties.stopCondition"),
        },
        {
          type: "Text",
          label: "Target Amount (mUSDT)",
          scope: scope("properties.targetAmount"),
          inputType: "number",
          placeholder: "e.g., 120",
        },
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Text",
              label: "Time Period",
              scope: scope("properties.timePeriod"),
              inputType: "number",
              placeholder: "1-365",
            },
            {
              type: "Select",
              label: "Time Unit",
              scope: scope("properties.timeUnit"),
            },
          ],
        },
        {
          type: "Text",
          label: "APR Threshold (%)",
          scope: scope("properties.aprThreshold"),
          inputType: "number",
          placeholder: "e.g., 2",
        },
        {
          type: "Select",
          label: "Auto-withdraw Destination",
          scope: scope("properties.autoWithdrawDestination"),
        },
      ],
    },
  ],
};
