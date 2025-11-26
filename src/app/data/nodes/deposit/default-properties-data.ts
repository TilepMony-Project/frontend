import type { NodeDataProperties } from "@/features/json-form/types/default-properties";
import type { DepositNodeSchema } from "./schema";

export const defaultPropertiesData: NodeDataProperties<DepositNodeSchema> = {
  label: "Deposit",
  description: "",
  amount: 1000,
  currency: "USD",
  paymentGateway: "DummyGatewayA",
};
