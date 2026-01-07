import type { Edge } from "@xyflow/react";
import type { WorkflowBuilderNode } from "@/types/node-data";

/**
 * Chain ID to Name mapping
 */
const CHAIN_NAMES: Record<number, string> = {
  5003: "Mantle Sepolia",
  84532: "Base Sepolia",
};

/**
 * Get the opposite chain ID for bridging
 */
const getOppositeChainId = (chainId: number): number => {
  return chainId === 5003 ? 84532 : 5003;
};

/**
 * Updates network metadata for all nodes based on the workflow structure.
 * Propagates chain context (Chain A -> Bridge -> Chain B).
 * @param nodes - Current workflow nodes
 * @param edges - Current workflow edges
 * @param sourceChainId - The starting chain ID (default: 5003 = Mantle Sepolia)
 */
export const updateNetworkMetadata = (
  nodes: WorkflowBuilderNode[],
  edges: Edge[],
  sourceChainId: number = 5003
): WorkflowBuilderNode[] => {
  // Sort nodes to process them in execution order
  const sortedNodes = sortNodesTopologically(nodes, edges);
  
  let currentChainId = sourceChainId;
  let currentChainName = CHAIN_NAMES[sourceChainId] || "Unknown Chain";
  let chainType: "source" | "destination" | "bridge" = "source";

  const updatedNodesMap = new Map<string, WorkflowBuilderNode>();
  
  // First pass: Process sorted nodes to determine context
  sortedNodes.forEach(node => {
    // Check both top-level type and data.type to be robust
    const isBridge = node.type === 'bridge' || (node.data && node.data.type === 'bridge');
    
    // Determine metadata for THIS node
    let nodeChainName = currentChainName;
    let nodeChainType = chainType;

    if (isBridge) {
      // Bridge nodes get special "bridge" type and "From -> To" label
      nodeChainType = "bridge";
      const destChainId = getOppositeChainId(currentChainId);
      nodeChainName = `${CHAIN_NAMES[currentChainId]} -> ${CHAIN_NAMES[destChainId]}`;
    }

    // Create new node object with updated meta
    const newNode: WorkflowBuilderNode = {
      ...node,
      data: {
        ...node.data,
        meta: {
          chainId: currentChainId, // ID stays as source for technical reasons (execution context)
          chainName: nodeChainName,
          isBridge,
          chainType: nodeChainType
        }
      }
    };

    updatedNodesMap.set(node.id, newNode);

    // If this is a bridge node, switch global context for SUBSEQUENT nodes
    if (isBridge) {
      const nextChainId = getOppositeChainId(currentChainId);
      currentChainId = nextChainId;
      currentChainName = CHAIN_NAMES[nextChainId] || "Unknown Chain";
      chainType = "destination"; // Subsequent nodes are destination
    }
  });

  // Second pass: Map original nodes to updated versions to preserve order
  // (though React Flow validates order mostly by ID, preserving array order is good practice)
  return nodes.map(n => updatedNodesMap.get(n.id) || n);
};

/**
 * Simple Kahn's algorithm for topological sort
 */
const sortNodesTopologically = (nodes: WorkflowBuilderNode[], edges: Edge[]): WorkflowBuilderNode[] => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  nodes.forEach(n => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });
  
  edges.forEach(e => {
    // Only verify nodes that exist in the current set
    if (adj.has(e.source) && inDegree.has(e.target)) {
      adj.get(e.source)?.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });
  
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });
  
  const result: WorkflowBuilderNode[] = [];
  
  while (queue.length > 0) {
    const u = queue.shift()!;
    const node = nodeMap.get(u);
    if (node) result.push(node);
    
    adj.get(u)?.forEach(v => {
      inDegree.set(v, (inDegree.get(v) || 0) - 1);
      if (inDegree.get(v) === 0) queue.push(v);
    });
  }
  
  // Append any nodes not reached (cycles or disconnected components not reachable from 0-degree nodes)
  // This ensures we don't lose nodes in the UI even if the graph is malformed
  nodes.forEach(n => {
    if (!result.find(r => r.id === n.id)) result.push(n);
  });
  
  return result;
};
