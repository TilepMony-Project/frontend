import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { ScheduleNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<ScheduleNodeSchema> = {
  label: "Schedule",
  description: "",
  scheduleType: "interval",
  intervalValue: 1,
  intervalUnit: "hours",
  cronExpression: "",
  loopCount: 10,
  startImmediately: true,
  enabled: true,
};
