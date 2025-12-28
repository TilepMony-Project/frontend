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
    },
    {
      type: "TextArea",
      label: "Description",
      scope: scope("properties.description"),
      placeholder: "Optional description for this yield deposit",
    },
    {
      type: "Accordion",
      label: "Yield Configuration",
      elements: [
        {
          type: "Select",
          label: "Underlying Token",
          scope: scope("properties.underlyingToken"),
        },
        {
          type: "Select",
          label: "Yield Adapter",
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
    {
      type: "Accordion",
      label: "Stop Conditions (Optional)",
      elements: [
        {
          type: "Select",
          label: "Stop Condition",
          scope: scope("properties.stopCondition"),
        },
        {
          type: "Text",
          label: "Target Amount",
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
