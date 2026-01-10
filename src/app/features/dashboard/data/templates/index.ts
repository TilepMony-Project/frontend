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
  scenario?: string;
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

const SCENARIOS: Record<string, string> = {
  "cross-border-treasury-transfer":
    "You have a subsidiary in Indonesia earning IDR, but your Singapore HQ needs USD for operations. Moving funds via banks takes 3-5 days and incurs high fees.",
  "treasury-fx-hedging":
    "Your treasury holds 100% USD. If the dollar weakens against the Euro, your purchasing power drops. You need to diversify without managing complex forex accounts.",
  "supply-chain-escrow":
    "You're buying goods from overseas. Shipping takes 30 days. You don't want to pay upfront, and the vendor won't ship without proof of funds. The money usually sits idle.",
  "revenue-split-tax":
    "Revenue hits your account and gets mixed with operational funds. Come tax season, you scramble for cash because you accidentally spent the tax reserve.",
  "multi-chain-gas-refill":
    "Your trading bots on Base and Optimism constantly run out of ETH for gas fees, crashing your service until an engineer manually tops them up.",
  "automated-onramp-investment-vault":
    "You just raised a round of funding. The cash is sitting in a checking account losing value to inflation, but you're too busy to manually manage DeFi yield farming.",
  "scheduled-salary-distribution":
    "It's the 25th of the month. You need to pay your remote team: Alice (Dev), Bob (Design), and Charlie (Marketing). Manually calculating and sending crypto is tedious.",
  "corporate-invoice-settlement":
    "You have a vendor invoice due in 15 days. You have the cash now, but paying early hurts cash flow, and forgetting to pay later incurs penalties.",
};

export const workflowTemplates: WorkflowTemplate[] = rawTemplates.map((template) => ({
  ...template,
  scenario: SCENARIOS[template.id],
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
