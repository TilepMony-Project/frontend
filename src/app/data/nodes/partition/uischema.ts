import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { PartitionNodeSchema } from "./schema";

const scope = getScope<PartitionNodeSchema>;

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
      placeholder: "Optional description for this partition",
    },
    {
      type: "Accordion",
      label: "Partition Configuration",
      elements: [
        {
          type: "Select",
          label: "Number of Output Branches",
          scope: scope("properties.numberOfBranches"),
        },
        {
          type: "Switch",
          label: "Auto-balance percentages",
          scope: scope("properties.autoBalance"),
        },
        {
          type: "Label",
          text: "Branch Allocations (must sum to 100%)",
        },
        // Note: Dynamic branch allocation fields would need custom control
        // For now, using a simple array structure
        {
          type: "Label",
          text: "Configure branch percentages in the properties panel",
        },
      ],
    },
  ],
};
