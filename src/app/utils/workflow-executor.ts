import {
  ActionType,
  encodeSwapData,
  encodeYieldDepositData,
  encodeYieldWithdrawData,
  encodeTransferData,
  encodeMintData,
  ZERO_ADDRESS,
  type Action,
} from "./mainController";
import {
  getTokenAddress,
  getSwapAdapterAddress,
  getYieldAdapterAddress,
  getTokenDecimals,
} from "../config/contractConfig";
import type { Node, Edge } from "@xyflow/react";
import type { Address } from "viem";
import { parseUnits } from "viem";

/**
 * Maps frontend node types to smart contract Action structs
 * Walks through the workflow nodes in topological order (assumed linear for now)
 */

export async function buildWorkflowActions(
  nodes: Node[],
  edges: Edge[],
  userAddress: string,
  targetNodeId?: string
): Promise<{ actions: Action[]; initialToken: string; initialAmount: bigint }> {
  // If targetNodeId is provided, only execute that node
  let nodesToProcess = nodes;
  if (targetNodeId) {
    const targetNode = nodes.find((n) => n.id === targetNodeId);
    if (!targetNode) throw new Error(`Target node ${targetNodeId} not found`);
    nodesToProcess = [targetNode];
  }

  // Sort nodes based on edges to determine execution order
  const sortedNodes = targetNodeId ? nodesToProcess : sortNodesMock(nodes, edges);

  const actions: Action[] = [];
  let initialToken = ZERO_ADDRESS as string;
  let initialAmount = BigInt(0);
  let lastOutputToken = ZERO_ADDRESS as string;

  for (const node of sortedNodes) {
    // Get properties from correct path: node.data.properties (not node.data directly)
    const nodeData = node.data as Record<string, any>;
    const properties = nodeData?.properties || nodeData || {};
    
    // Get node type from correct path: node.data.type or fallback to node.type
    const nodeType = nodeData?.type || node.type;

    switch (nodeType) {
      case "mint": {
        const tokenAddress = getTokenAddress(properties.token);
        const decimals = getTokenDecimals(tokenAddress);
        const amount = parseUnits((properties.amount || 0).toString(), decimals);

        if (actions.length === 0) {
          initialToken = ZERO_ADDRESS; // External source (faucet/mint)
          initialAmount = BigInt(0);
        }

        const action: Action = {
          actionType: ActionType.MINT,
          targetContract: tokenAddress as Address,
          data: encodeMintData(tokenAddress, amount),
          inputAmountPercentage: BigInt(10000),
        };
        actions.push(action);
        lastOutputToken = tokenAddress;
        break;
      }

      case "swap": {
        const adapterAddress = getSwapAdapterAddress(properties.swapAdapter);
        if (!adapterAddress)
          throw new Error(`Invalid swap adapter: ${properties.swapAdapter}`);

        const tokenIn =
          properties.inputToken === "DYNAMIC"
            ? ZERO_ADDRESS
            : getTokenAddress(properties.inputToken);

        const tokenOut = getTokenAddress(properties.outputToken);
        const percentage = BigInt(properties.percentageOfInput || 10000);

        if (actions.length === 0) {
          initialToken = tokenIn;
          const decimals = getTokenDecimals(tokenIn);
          initialAmount = parseUnits((properties.amount || 0).toString(), decimals);
        }

        const action: Action = {
          actionType: ActionType.SWAP,
          targetContract: adapterAddress as Address,
          data: encodeSwapData(
            adapterAddress,
            tokenIn,
            tokenOut,
            BigInt(0),
            BigInt(0),
            ZERO_ADDRESS
          ),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        lastOutputToken = tokenOut;
        break;
      }

      case "vault": {
        const adapterAddress = getYieldAdapterAddress(properties.yieldAdapter);
        if (!adapterAddress)
          throw new Error(`Invalid yield adapter: ${properties.yieldAdapter}`);

        const token =
          properties.underlyingToken === "DYNAMIC"
            ? ZERO_ADDRESS
            : getTokenAddress(properties.underlyingToken);

        const percentage = BigInt(properties.percentageOfInput || 10000);

        if (actions.length === 0) {
          initialToken = token;
          const decimals = getTokenDecimals(token);
          initialAmount = parseUnits((properties.amount || 0).toString(), decimals);
        }

        const action: Action = {
          actionType: ActionType.YIELD,
          targetContract: adapterAddress as Address,
          data: encodeYieldDepositData(adapterAddress, token, BigInt(0)),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        lastOutputToken = ZERO_ADDRESS; 
        break;
      }

      case "transfer": {
        const token =
          properties.token === "DYNAMIC"
            ? ZERO_ADDRESS
            : getTokenAddress(properties.token);

        const percentage = BigInt(properties.percentageOfInput || 10000);

        if (actions.length === 0) {
          initialToken = token;
          const decimals = getTokenDecimals(token);
          initialAmount = parseUnits((properties.amount || 0).toString(), decimals);
        }

        const action: Action = {
          actionType: ActionType.TRANSFER,
          targetContract: (properties.recipientAddress || ZERO_ADDRESS) as Address,
          data: encodeTransferData(token),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        lastOutputToken = ZERO_ADDRESS;
        break;
      }
    }
  }

  // If there is an output token and last action was NOT a transfer/vault, 
  // we implicitly transfer the balance to the user.
  if (lastOutputToken !== ZERO_ADDRESS && userAddress) {
    const transferAction: Action = {
      actionType: ActionType.TRANSFER,
      targetContract: userAddress as Address,
      data: encodeTransferData(lastOutputToken),
      inputAmountPercentage: BigInt(10000), // 100% of remaining balance
    };
    actions.push(transferAction);
  }

  return { actions, initialToken, initialAmount };
}

/**
 * Simple topological sort mock
 */
function sortNodesMock(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const incomingEdges = new Set(edges.map(e => e.target));
  const startNode = nodes.find(n => !incomingEdges.has(n.id));

  if (!startNode) return nodes;

  const sorted: Node[] = [startNode];
  let current = startNode;

  while (true) {
    const edge = edges.find(e => e.source === current.id);
    if (!edge) break;
    
    const nextNode = nodeMap.get(edge.target);
    if (nextNode) {
      sorted.push(nextNode);
      current = nextNode;
    } else {
      break;
    }
  }

  return sorted;
}
