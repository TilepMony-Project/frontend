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
    },
    {
      type: "TextArea",
      label: "Description",
      scope: scope("properties.description"),
    },
    {
      type: "Label",
      text: "This node splits the workflow. Connect multiple output nodes and configure their 'Percentage of Input' to divide the funds.",
    },
  ],
};
