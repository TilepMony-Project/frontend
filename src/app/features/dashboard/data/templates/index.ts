import type { LayoutDirection } from "@/types/common";
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from "@/types/node-data";

import automatedOnRampData from "./automated-onramp-investment-vault.json";
import invoiceSettlementData from "./corporate-invoice-settlement.json";
import crossBorderData from "./cross-border-treasury-transfer.json";
import salaryDistributionData from "./scheduled-salary-distribution.json";

import multiChainGasData from "./multi-chain-gas-refill.json";
import revenueSplitData from "./revenue-split-tax.json";
import supplyChainEscrowData from "./supply-chain-escrow.json";
import treasuryFxData from "./treasury-fx-hedging.json";

export type WorkflowTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  layoutDirection: LayoutDirection;
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
};

const rawTemplates = [
  crossBorderData,
  treasuryFxData,
  supplyChainEscrowData,
  revenueSplitData,
  multiChainGasData,
  automatedOnRampData,
  salaryDistributionData,
  invoiceSettlementData,
] as WorkflowTemplate[];

export const workflowTemplates: WorkflowTemplate[] = rawTemplates.map((template) => ({
  ...template,
  nodes: template.nodes.map((node) => ({
    ...node,
    data: {
      segments: [],
      ...node.data,
      properties: {
        ...(node.data?.properties ?? {}),
      },
    },
  })),
  edges: template.edges.map((edge) => ({
    animated: false,
    ...edge,
    type: edge.type ?? "labelEdge",
  })),
}));
