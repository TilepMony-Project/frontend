import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { SwapNodeSchema } from "./schema";

const scope = getScope<SwapNodeSchema>;

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
      placeholder: "Optional description for this swap operation",
    },
    {
      type: "Accordion",
      label: "Swap Configuration",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Select",
              label: "Input Token",
              scope: scope("properties.inputToken"),
            },
            {
              type: "Select",
              label: "Output Token",
              scope: scope("properties.outputToken"),
            },
          ],
        },
        {
          type: "Text",
          label: "Amount to Swap",
          scope: scope("properties.amount"),
          inputType: "number",
          placeholder: "Enter amount",
        },
        {
          type: "Select",
          label: "Swap Provider",
          scope: scope("properties.swapProvider"),
        },
        {
          type: "Text",
          label: "Slippage Tolerance (%)",
          scope: scope("properties.slippageTolerance"),
          inputType: "number",
          placeholder: "0.1 - 5",
        },
        {
          type: "Select",
          label: "Preferred Route",
          scope: scope("properties.preferredRoute"),
        },
      ],
    },
  ],
};
