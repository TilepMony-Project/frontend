import type { Edge } from "@xyflow/react";
import type { WorkflowBuilderNode } from "@/types/node-data";

/**
 * Updates network metadata for all nodes based on the workflow structure.
 * Propagates chain context (Chain A -> Bridge -> Chain B).
 */
export const updateNetworkMetadata = (
  nodes: WorkflowBuilderNode[],
  edges: Edge[]
): WorkflowBuilderNode[] => {
  // Sort nodes to process them in execution order
  const sortedNodes = sortNodesTopologically(nodes, edges);
  
  let currentChainId = 5003; // Default: Mantle Sepolia
  let currentChainName = "Mantle Sepolia";
  let chainType: "source" | "destination" = "source";

  const updatedNodesMap = new Map<string, WorkflowBuilderNode>();
  
  // First pass: Process sorted nodes to determine context
  sortedNodes.forEach(node => {
    const isBridge = node.type === 'bridge';
    
    // Create new node object with updated meta
    // Note: We create a shallow copy of data to avoid mutating read-only props if any
    const newNode: WorkflowBuilderNode = {
      ...node,
      data: {
        ...node.data,
        meta: {
          chainId: currentChainId,
          chainName: currentChainName,
          isBridge,
          chainType
        }
      }
    };

    updatedNodesMap.set(node.id, newNode);

    // If this is a bridge node, switch context for SUBSEQUENT nodes
    if (isBridge) {
      currentChainId = 84532; // Base Sepolia
      currentChainName = "Base Sepolia";
      chainType = "destination";
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
