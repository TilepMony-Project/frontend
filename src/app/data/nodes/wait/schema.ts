import type { NodeSchema } from "@/types/node-schema";

export const timeUnitOptions = [
  { label: "Seconds", value: "seconds" },
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
];

export const schema = {
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
    delayDuration: {
      type: "number",
      minimum: 1,
      maximum: 31536000, // 365 days in seconds (max)
    },
    timeUnit: {
      type: "string",
      options: timeUnitOptions,
    },
    reason: {
      type: "string",
    },
  },
} satisfies NodeSchema;

export type WaitNodeSchema = typeof schema;
