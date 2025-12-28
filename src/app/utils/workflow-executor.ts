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
} from "../config/contractConfig";
import type { Node, Edge } from "@xyflow/react";
import type { Address } from "viem";

/**
 * Maps frontend node types to smart contract Action structs
 * Walks through the workflow nodes in topological order (assumed linear for now)
 */

export async function buildWorkflowActions(
  nodes: Node[],
  edges: Edge[],
  userAddress: string
): Promise<{ actions: Action[]; initialToken: string; initialAmount: bigint }> {
  // Sort nodes based on edges to determine execution order
  // For MVP, we assume a linear chain: Mint -> Swap/Action -> ... -> Transfer
  const sortedNodes = sortNodesMock(nodes, edges);

  const actions: Action[] = [];
  let initialToken = ZERO_ADDRESS as string;
  let initialAmount = BigInt(0);

  for (const node of sortedNodes) {
    const properties = node.data as Record<string, any>;

    switch (node.type) {
      case "mint": {
        const tokenAddress = getTokenAddress(properties.token);
        const amount = BigInt(properties.amount || 0);

        if (actions.length === 0) {
          initialToken = tokenAddress;
          initialAmount = amount;
        }

        const action: Action = {
          actionType: ActionType.MINT,
          targetContract: tokenAddress as Address,
          data: encodeMintData(tokenAddress, amount),
          inputAmountPercentage: BigInt(0), 
        };
        actions.push(action);
        break;
      }

      case "swap": {
        const adapterAddress = getSwapAdapterAddress(properties.swapAdapter);
        if (!adapterAddress) throw new Error(`Invalid swap adapter: ${properties.swapAdapter}`);

        const tokenIn = properties.inputToken === "DYNAMIC" 
          ? ZERO_ADDRESS 
          : getTokenAddress(properties.inputToken);
        
        const tokenOut = getTokenAddress(properties.outputToken);
        
        const percentage = BigInt(properties.percentageOfInput || 10000);
        
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
        break;
      }

      case "vault": {
        const adapterAddress = getYieldAdapterAddress(properties.yieldAdapter);
        if (!adapterAddress) throw new Error(`Invalid yield adapter: ${properties.yieldAdapter}`);
        
        const token = properties.underlyingToken === "DYNAMIC"
          ? ZERO_ADDRESS
          : getTokenAddress(properties.underlyingToken);
          
        const percentage = BigInt(properties.percentageOfInput || 10000);

        const action: Action = {
          actionType: ActionType.YIELD,
          targetContract: adapterAddress as Address,
          data: encodeYieldDepositData(
            adapterAddress,
            token,
            BigInt(0)
          ),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }

      case "transfer": {
        const token = properties.token === "DYNAMIC"
          ? ZERO_ADDRESS
          : getTokenAddress(properties.token);
          
        const percentage = BigInt(properties.percentageOfInput || 10000);
        
        const action: Action = {
          actionType: ActionType.TRANSFER,
          targetContract: (token === ZERO_ADDRESS ? ZERO_ADDRESS : token) as Address,
          data: encodeTransferData(token),
          inputAmountPercentage: percentage,
        };
        actions.push(action);
        break;
      }
    }
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
