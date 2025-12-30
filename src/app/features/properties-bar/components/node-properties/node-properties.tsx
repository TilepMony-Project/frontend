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
import { useAccount } from "wagmi";

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

  const { accessToken } = usePrivySession();
  const getFreshToken = useGetFreshToken();
  const amount = Number(propertiesData.amount || 0);

  // Consolidate balance logic for both Deposit and Mint
  const mintToken = propertiesData.token as string | undefined;
  // If deposit, use explicitly selected currency. If mint, map token to currency.
  const activeCurrency =
    nodeType === "deposit"
      ? (propertiesData.currency as string | undefined)
      : mintToken === "IDRX"
      ? "IDR"
      : mintToken
      ? "USD"
      : undefined;

  useEffect(() => {
    if ((nodeType !== "deposit" && nodeType !== "mint") || !accessToken) return;

    if (!activeCurrency) return;

    let active = true;

    async function updateBalanceInfo() {
      const freshToken = await getFreshToken();
      if (!freshToken) return;

      try {
        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });

        if (!response.ok || !active) return;

        const profile = await response.json();
        const balances = profile.fiatBalances || { IDR: 0, USD: 0 };
        const currentBalance =
          balances[activeCurrency as keyof typeof balances] || 0;

        // Deduction for mint, addition for deposit
        const balanceModifier = nodeType === "mint" ? -1 : 1;
        const projectedBalance = currentBalance + amount * balanceModifier;

        const formatter = new Intl.NumberFormat(
          activeCurrency === "IDR" ? "id-ID" : "en-US",
          {
            style: "currency",
            currency: activeCurrency!,
          }
        );

        const currentBalanceText = `Current Balance: ${formatter.format(
          currentBalance
        )}`;
        const projectedLabel =
          nodeType === "mint" ? "After Mint" : "After Deposit";
        const projectedBalanceText = `${projectedLabel}: ${formatter.format(
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
        console.error(`Failed to fetch balance for ${nodeType} node`, error);
      }
    }

    const timer = setTimeout(() => {
      void updateBalanceInfo();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    nodeType,
    accessToken,
    activeCurrency,
    amount,
    id,
    getFreshToken,
    setNodeProperties,
    propertiesData.currentBalanceText,
    propertiesData.projectedBalanceText,
  ]);

  // Inject user wallet address for Transfer node if empty
  const { address: userAddress } = useAccount();

  useEffect(() => {
    if (
      nodeType !== "transfer" ||
      !userAddress ||
      propertiesData.recipientAddress
    ) {
      return;
    }

    setNodeProperties(id, {
      ...propertiesData,
      recipientAddress: userAddress,
    });
  }, [
    nodeType,
    userAddress,
    propertiesData.recipientAddress,
    id,
    setNodeProperties,
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
