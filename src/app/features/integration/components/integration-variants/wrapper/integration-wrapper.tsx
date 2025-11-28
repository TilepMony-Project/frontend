import { type PropsWithChildren, useEffect } from "react";

import { loadData } from "@/features/integration/stores/use-integration-store";
import type { IntegrationDataFormatOptional, OnSave } from "@/features/integration/types";

import { IntegrationContextWrapper } from "../context/integration-context-wrapper";

type Props = PropsWithChildren<
  IntegrationDataFormatOptional & {
    onSave: OnSave;
  }
>;

export function IntegrationWrapper({
  children,
  name,
  nodes,
  edges,
  onSave,
}: Props) {
  useEffect(() => {
    loadData({
      name,
      nodes,
      edges,
    });
  }, [edges, name, nodes]);

  return <IntegrationContextWrapper onSave={onSave}>{children}</IntegrationContextWrapper>;
}
