import type { Edge, Node } from "@xyflow/react";
import type { Address } from "viem";
import { parseUnits } from "viem";
import {
  ADDRESSES,
  getShareTokenAddress,
  getSwapAdapterAddress,
  getTokenAddress,
  getTokenDecimals,
  getYieldAdapterAddress,
} from "../config/contractConfig";
import {
  type Action,
  ActionType,
  ZERO_ADDRESS,
  encodeMintData,
  encodeSwapData,
  encodeTransferData,
  encodeYieldDepositData,
  encodeYieldWithdrawData,
} from "./mainController";

/**
 * Maps frontend node types to smart contract Action structs
 * Walks through the workflow nodes in topological order (assumed linear for now)
 */

// Explicit Logic Confirmation:
// 1. If property is "DYNAMIC", use ZERO_ADDRESS. MainController uses previous action's output.
// 2. If property is Specific Token, use Token Address. MainController pulls from User Wallet (if supported/required).

export async function buildWorkflowActions(
  nodes: Node[],
  edges: Edge[],
  userAddress: string,
  nodeIds?: string[]
): Promise<{ actions: Action[]; initialToken: string; initialAmount: bigint }> {
  // Sort all nodes based on edges to determine the correct execution order first
  const sortedFullWorkflow = sortNodesMock(nodes, edges);

  // If nodeIds are provided, only execute those specific nodes
  // We filter the already sorted nodes to maintain the correct logical order
  let nodesToProcess = sortedFullWorkflow;
  if (nodeIds && nodeIds.length > 0) {
    nodesToProcess = sortedFullWorkflow.filter((n) => nodeIds.includes(n.id));
    if (nodesToProcess.length === 0) {
      throw new Error(`None of the target nodes ${nodeIds.join(", ")} found`);
    }
  }

  const sortedNodes = nodesToProcess;

  const actions: Action[] = [];
  let initialToken = ZERO_ADDRESS as string;
  let initialAmount = BigInt(0);
  const partitionRemaining: Record<string, bigint> = {};

  for (const node of sortedNodes) {
    // Get properties from correct path: node.data.properties (not node.data directly)
    const nodeData = node.data as Record<string, any>;
    const properties = nodeData?.properties || nodeData || {};

    // Get node type from correct path: node.data.type or fallback to node.type
    const nodeType = nodeData?.type || node.type;

    let percentage = BigInt(properties.percentageOfInput || 10000);

    // Partition Logic: Recalculate percentage if parent is Partition
    const incomingEdge = edges.find((e) => e.target === node.id);
    const parentNode = incomingEdge ? nodes.find((n) => n.id === incomingEdge.source) : null;
    const parentType = parentNode ? parentNode.data?.type || parentNode.type : "";

    if (parentNode && parentType === "partition") {
      const pId = parentNode.id;
      if (partitionRemaining[pId] === undefined) {
        partitionRemaining[pId] = BigInt(10000);
      }

      const remaining = partitionRemaining[pId];
      const desired = percentage;

      // Formula: New% = (Desired / Remaining) * 10000
      if (remaining > BigInt(0)) {
        percentage = (desired * BigInt(10000)) / remaining;
        if (percentage > BigInt(10000)) percentage = BigInt(10000);

        partitionRemaining[pId] = remaining - desired;
      } else {
        percentage = BigInt(0);
      }
    }

    switch (nodeType) {
      case "partition":
        // Partition node itself emits no action, just acts as a logic anchor
        continue;

      case "mint": {
        const tokenAddress = getTokenAddress(properties.token);
        const decimals = getTokenDecimals(tokenAddress);
        const amount = parseUnits((properties.amount || 0).toString(), decimals);

        if (actions.length === 0) {
          // MINT source is always external (faucet), so initialToken is ZERO
          initialToken = ZERO_ADDRESS;
          initialAmount = BigInt(0);
        }

        const action: Action = {
          actionType: ActionType.MINT,
          targetContract: tokenAddress as Address,
          data: encodeMintData(tokenAddress, amount),
          inputAmountPercentage: BigInt(10000),
        };
        actions.push(action);
        break;
      }

      case "swap": {
        const adapterAddress = getSwapAdapterAddress(properties.swapAdapter);
        if (!adapterAddress) throw new Error(`Invalid swap adapter: ${properties.swapAdapter}`);

        // DYNAMIC -> ZERO_ADDRESS (From previous output)
        // Specific -> Token Address (From User Wallet)
        const tokenIn =
          properties.inputToken === "DYNAMIC"
            ? ZERO_ADDRESS
            : getTokenAddress(properties.inputToken);

        const tokenOut = getTokenAddress(properties.outputToken);

        // If source is specific, we use the specified amount
        let amountIn = BigInt(0);
        if (tokenIn !== ZERO_ADDRESS) {
          const decimals = getTokenDecimals(tokenIn);
          const rawAmount = properties.amount || 0;
          if (Number(rawAmount) <= 0) {
            throw new Error(
              `Amount must be greater than 0 when using specific input token (${properties.inputToken})`
            );
          }
          amountIn = parseUnits(rawAmount.toString(), decimals);
        }

        if (actions.length === 0) {
          initialToken = tokenIn;
          // If it's the first node, use the calculated amountIn as initialAmount
          // If tokenIn is specific, amountIn > 0. If DYNAMIC, amountIn=0 (but logic handles it)
          initialAmount = amountIn;

          // Legacy check: properties.amount logic was here before, now streamlined above.
          if (tokenIn !== ZERO_ADDRESS && amountIn === BigInt(0)) {
            // Fallback if amount wasn't parsed above? No, above logic covers it.
            const decimals = getTokenDecimals(tokenIn);
            initialAmount = parseUnits((properties.amount || 0).toString(), decimals);
          }
        }

        const action: Action = {
          actionType: ActionType.SWAP,
          targetContract: ADDRESSES.CORE.SwapAggregator as Address,
          data: encodeSwapData(
            adapterAddress,
            tokenIn,
            tokenOut,
            amountIn, // Pass explicit amount
            BigInt(0),
            ADDRESSES.CORE.MainController
          ),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }

      case "yield-deposit": {
        let adapterName = properties.yieldAdapter;

        // Handle Compound implicit adapter naming
        if (adapterName === "CompoundAdapter") {
          const tokenSymbol = properties.underlyingToken;
          if (tokenSymbol && tokenSymbol !== "DYNAMIC") {
            adapterName = `CompoundAdapter${tokenSymbol}`;
          } else {
            throw new Error(
              "Compound Adapter requires specific underlying token (cannot be DYNAMIC)"
            );
          }
        }

        const adapterAddress = getYieldAdapterAddress(adapterName);
        if (!adapterAddress) throw new Error(`Invalid yield adapter: ${adapterName}`);

        // DYNAMIC -> ZERO_ADDRESS (From previous output)
        // Specific -> Token Address (From User Wallet)
        const token =
          properties.underlyingToken === "DYNAMIC"
            ? ZERO_ADDRESS
            : getTokenAddress(properties.underlyingToken);

        let amount = BigInt(0);
        if (token !== ZERO_ADDRESS) {
          const decimals = getTokenDecimals(token);
          const rawAmount = properties.amount || 0;
          if (Number(rawAmount) <= 0) {
            throw new Error(
              `Amount must be greater than 0 when using specific underlying token (${properties.underlyingToken})`
            );
          }
          amount = parseUnits(rawAmount.toString(), decimals);
        }

        if (actions.length === 0) {
          initialToken = token;
          initialAmount = amount;
        }

        const action: Action = {
          actionType: ActionType.YIELD,
          targetContract: ADDRESSES.YIELD.ROUTER as Address,
          data: encodeYieldDepositData(adapterAddress, token, amount, "0x"), // Pass explicit amount
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }

      case "yield-withdraw": {
        let adapterName = properties.yieldAdapter;

        // Handle Compound implicit adapter naming
        if (adapterName === "CompoundAdapter") {
          const tokenSymbol = properties.underlyingToken;
          if (tokenSymbol && tokenSymbol !== "DYNAMIC") {
            adapterName = `CompoundAdapter${tokenSymbol}`;
          } else {
            throw new Error(
              "Compound Adapter requires specific underlying token (cannot be DYNAMIC)"
            );
          }
        }

        const adapterAddress = getYieldAdapterAddress(adapterName);
        if (!adapterAddress) throw new Error(`Invalid yield adapter: ${adapterName}`);

        // Share token source: DYNAMIC (previous) or Specific (User Wallet)
        const shareToken =
          properties.shareToken === "DYNAMIC"
            ? ZERO_ADDRESS
            : getShareTokenAddress(properties.shareToken);

        const underlyingToken = getTokenAddress(properties.underlyingToken);

        let amount = BigInt(0);
        if (shareToken !== ZERO_ADDRESS) {
          const decimals = getTokenDecimals(shareToken);
          const rawAmount = properties.amount || 0;
          if (Number(rawAmount) <= 0) {
            throw new Error(
              `Amount must be greater than 0 when using specific share token (${properties.shareToken})`
            );
          }
          amount = parseUnits(rawAmount.toString(), decimals);
        }

        if (actions.length === 0) {
          initialToken = shareToken;
          initialAmount = amount;
        }

        const action: Action = {
          actionType: ActionType.YIELD_WITHDRAW,
          targetContract: ADDRESSES.YIELD.ROUTER as Address,
          data: encodeYieldWithdrawData(adapterAddress, shareToken, underlyingToken, amount, "0x"), // Pass explicit amount
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }

      case "transfer": {
        // DYNAMIC -> ZERO_ADDRESS (From previous output)
        // Specific -> Token Address (From User Wallet)
        const token =
          properties.token === "DYNAMIC" ? ZERO_ADDRESS : getTokenAddress(properties.token);

        let amount = BigInt(0);
        if (token !== ZERO_ADDRESS) {
          const decimals = getTokenDecimals(token);
          const rawAmount = properties.amount || 0;
          if (Number(rawAmount) <= 0) {
            throw new Error(
              `Amount must be greater than 0 when using specific token (${properties.token})`
            );
          }
          amount = parseUnits(rawAmount.toString(), decimals);
        }

        if (actions.length === 0) {
          initialToken = token;
          initialAmount = amount;
        }

        const action: Action = {
          actionType: ActionType.TRANSFER,
          targetContract: (properties.recipientAddress || userAddress || ZERO_ADDRESS) as Address,
          data: encodeTransferData(token),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }

      case "redeem": {
        // Source Token: DYNAMIC (Previous Step) or Specific (User Wallet)
        if (!properties.token) {
          throw new Error("Please select a token for Redeem node");
        }
        const token =
          properties.token === "DYNAMIC" ? ZERO_ADDRESS : getTokenAddress(properties.token);

        // Destination: Main Controller (Treasury)
        const recipient = ADDRESSES.CORE.MainController;

        let amount = BigInt(0);
        if (token !== ZERO_ADDRESS) {
          const decimals = getTokenDecimals(token);
          const rawAmount = properties.amount || 0;
          if (Number(rawAmount) <= 0) {
            throw new Error(
              `Amount must be greater than 0 when using specific token (${properties.token})`
            );
          }
          amount = parseUnits(rawAmount.toString(), decimals);
        }

        if (actions.length === 0) {
          initialToken = token;
          initialAmount = amount;
        }

        const action: Action = {
          actionType: ActionType.TRANSFER,
          targetContract: recipient as Address,
          data: encodeTransferData(token),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }
    }
  }

  // NOTE: No implicit transfer is added.
  // Users must explicitly add a Transfer node to move funds from MainController to their wallet.
  // This gives full control over workflow composition.

  return { actions, initialToken, initialAmount };
}

/**
 * Simple topological sort mock
 */
function sortNodesMock(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  // Initialize
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  // Build Graph
  edges.forEach((e) => {
    if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
      adj.get(e.source)?.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  // Queue for Kahn's Algo
  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted: Node[] = [];

  while (queue.length > 0) {
    const u = queue.shift()!;
    const node = nodeMap.get(u);
    if (node) sorted.push(node);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      inDegree.set(v, (inDegree.get(v) || 0) - 1);
      if (inDegree.get(v) === 0) {
        queue.push(v);
      }
    }
  }

  // If sorted.length < nodes.length, there is a cycle.
  // For now, valid DAG assumed.

  return sorted;
}
