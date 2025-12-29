import type { WorkflowBuilderNode } from "@/types/node-data";
import useStore from "@/store/store";
import type { JsonFormsReactProps } from "@jsonforms/react";
import { JSONForm } from "@/features/json-form/json-form";
import type { JsonFormsProps } from "@jsonforms/core";
import { isDeepEqual } from "remeda";
import { useRef, useEffect, memo } from "react";
import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";
import { flatErrors } from "@/utils/validation/flat-errors";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useGetFreshToken } from "@/hooks/use-get-fresh-token";

type Props = {
  node: WorkflowBuilderNode;
};

export const NodeProperties = memo(({ node }: Props) => {
  const getNodeDefinition = useStore((state) => state.getNodeDefinition);
  const setNodeProperties = useStore((state) => state.setNodeProperties);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);

  const { data, id } = node;
  const { properties, type } = data;
  const nodeType = typeof type === "string" ? type : undefined;
  const propertiesData =
    properties && typeof properties === "object"
      ? (properties as Record<string, unknown>)
      : {};

  if (!nodeType) {
    return;
  }

  const nodeDefinition = getNodeDefinition(nodeType);
  if (!nodeDefinition) {
    return;
  }

  const schemaDefinition = nodeDefinition.schema as
    | JsonFormsProps["schema"]
    | undefined;
  const uischemaDefinition = nodeDefinition.uischema as
    | JsonFormsProps["uischema"]
    | undefined;

  if (!schemaDefinition || !uischemaDefinition) {
    return;
  }

  // Ad-hoc logic for Deposit Node: Fetch balance and calculate projection
  // This avoids creating a custom JSON Form control
  const { accessToken } = usePrivySession();
  const getFreshToken = useGetFreshToken();

  const currency = propertiesData.currency as string | undefined;
  const amount = Number(propertiesData.amount || 0);

  useEffect(() => {
    if (nodeType !== "deposit" || !accessToken) return;

    if (!currency) return;

    let active = true;

    async function updateDepositInfo() {
      const freshToken = await getFreshToken();
      if (!freshToken) return;

      try {
        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });

        if (!response.ok || !active) return;

        const profile = await response.json();
        const balances = profile.fiatBalances || { IDR: 0, USD: 0 };
        const currentBalance = balances[currency as keyof typeof balances] || 0;
        const projectedBalance = currentBalance + amount;

        const formatter = new Intl.NumberFormat(
          currency === "IDR" ? "id-ID" : "en-US",
          {
            style: "currency",
            currency: currency!,
          }
        );

        const currentBalanceText = `Current Balance: ${formatter.format(
          currentBalance
        )}`;
        const projectedBalanceText = `After Deposit: ${formatter.format(
          projectedBalance
        )}`;

        // Only update if changed to prevent loops
        if (
          propertiesData.currentBalanceText !== currentBalanceText ||
          propertiesData.projectedBalanceText !== projectedBalanceText
        ) {
          setNodeProperties(id, {
            ...propertiesData,
            currentBalanceText,
            projectedBalanceText,
          });
        }
      } catch (error) {
        console.error("Failed to fetch balance for deposit node", error);
      }
    }

    const timer = setTimeout(() => {
      void updateDepositInfo();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    nodeType,
    accessToken,
    currency,
    amount,
    id,
    getFreshToken,
    setNodeProperties,
    propertiesData.currentBalanceText,
    propertiesData.projectedBalanceText,
    propertiesData, // Include this because we use propertiesData spread in setNodeProperties
  ]);

  const onChange: JsonFormsReactProps["onChange"] = ({ data, errors }) => {
    const flattenErrors = flatErrors(errors);

    if (!isDeepEqual({ ...data, errors: flattenErrors }, propertiesData)) {
      trackFutureChange("dataUpdate");
      setNodeProperties(id, { ...data, errors: flattenErrors });
    }
  };

  return (
    <JSONForm
      data={propertiesData}
      schema={schemaDefinition}
      uischema={uischemaDefinition}
      onChange={onChange}
      readonly={isReadOnlyMode}
    />
  );
});
