import type { NodeSchema } from "@/types/node-schema";

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
  },
} satisfies NodeSchema;

export type PartitionNodeSchema = typeof schema;
