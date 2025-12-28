import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { VaultNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<VaultNodeSchema> = {
  label: "Yield Deposit",
  description: "",
  underlyingToken: "IDRX",
  yieldAdapter: "MethLabAdapter",
  percentageOfInput: 10000, // 100% in basis points
  stopCondition: "targetAmount",
  targetAmount: 1200,
  timePeriod: 30,
  timeUnit: "days",
  aprThreshold: 2,
  autoWithdrawDestination: "redeem",
};
