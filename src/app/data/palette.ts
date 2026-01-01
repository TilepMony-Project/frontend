import type { PaletteItem } from "@/types/common";
import { bridgeNode } from "./nodes/bridge/bridge";
// TilepMoney nodes - organized by category
// Input Nodes
import { depositNode } from "./nodes/deposit/deposit";
// Processing Nodes
import { mintNode } from "./nodes/mint/mint";
import { partitionNode } from "./nodes/partition/partition";
// Output Nodes
import { redeemNode } from "./nodes/redeem/redeem";
import { scheduleNode } from "./nodes/schedule/schedule";
import { swapNode } from "./nodes/swap/swap";
import { transferNode } from "./nodes/transfer/transfer";
// Utility Nodes
import { waitNode } from "./nodes/wait/wait";
// Yield Nodes
import { yieldDepositNode } from "./nodes/yield-deposit/yield-deposit";
import { yieldWithdrawNode } from "./nodes/yield-withdraw/yield-withdraw";

// Organized by category for TilepMoney
export const paletteData: PaletteItem[] = [
  // Input/Redemption Nodes
  depositNode,
  redeemNode,

  // Processing Nodes
  mintNode,
  swapNode,
  bridgeNode,

  // Yield Nodes
  yieldDepositNode,
  yieldWithdrawNode,

  // Transfer Nodes
  transferNode,

  // Logic/Utility Nodes
  partitionNode,
  scheduleNode,
  waitNode,
];
