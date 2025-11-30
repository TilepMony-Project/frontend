import type { NodeSchema } from "@/types/node-schema";

export const scheduleTypeOptions = [
   { label: "Interval", value: "interval" },
   { label: "Cron Expression", value: "cron" },
   { label: "Fixed Count", value: "count" },
];

export const intervalUnitOptions = [
   { label: "Minutes", value: "minutes" },
   { label: "Hours", value: "hours" },
   { label: "Days", value: "days" },
   { label: "Weeks", value: "weeks" },
];

export const schema = {
   properties: {
      label: {
         type: "string",
      },
      description: {
         type: "string",
      },
      scheduleType: {
         type: "string",
         options: scheduleTypeOptions,
      },
      // Interval-based scheduling
      intervalValue: {
         type: "number",
         minimum: 1,
         maximum: 10000,
      },
      intervalUnit: {
         type: "string",
         options: intervalUnitOptions,
      },
      // Cron expression
      cronExpression: {
         type: "string",
      },
      // Fixed count loop
      loopCount: {
         type: "number",
         minimum: 1,
         maximum: 1000,
      },
      // Common settings
      startImmediately: {
         type: "boolean",
      },
      enabled: {
         type: "boolean",
      },
   },
} satisfies NodeSchema;

export type ScheduleNodeSchema = typeof schema;
