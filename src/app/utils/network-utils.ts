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
 * Check if a node is a bridge node
 */
const isBridgeNode = (node: WorkflowBuilderNode): boolean => {
  return node.type === "bridge" || (node.data && node.data.type === "bridge");
};

/**
 * Updates network metadata for all nodes based on the workflow structure.
 * Each connected component is processed separately, starting from sourceChainId.
 * Chain only changes after encountering a bridge node within that component.
 *
 * @param nodes - Current workflow nodes
 * @param edges - Current workflow edges
 * @param sourceChainId - The starting chain ID (default: 5003 = Mantle Sepolia)
 */
export const updateNetworkMetadata = (
  nodes: WorkflowBuilderNode[],
  edges: Edge[],
  sourceChainId: number = 5003
): WorkflowBuilderNode[] => {
  if (nodes.length === 0) return nodes;

  // Build adjacency lists (both directions for component detection)
  const adj = new Map<string, string[]>(); // source -> targets
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, WorkflowBuilderNode>();

  nodes.forEach((n) => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
    nodeMap.set(n.id, n);
  });

  edges.forEach((e) => {
    if (adj.has(e.source) && inDegree.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  const updatedNodesMap = new Map<string, WorkflowBuilderNode>();
  const visited = new Set<string>();

  /**
   * Process a single node and its downstream nodes (DFS with chain propagation)
   */
  const processNodeChain = (
    nodeId: string,
    chainId: number,
    chainType: "source" | "destination"
  ) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return;

    const isBridge = isBridgeNode(node);

    // Determine this node's chain label
    let nodeChainName = CHAIN_NAMES[chainId] || "Unknown Chain";
    let nodeChainType: "source" | "destination" | "bridge" = chainType;

    if (isBridge) {
      nodeChainType = "bridge";
      const destChainId = getOppositeChainId(chainId);
      nodeChainName = `${CHAIN_NAMES[chainId]} -> ${CHAIN_NAMES[destChainId]}`;
    }

    // Create updated node
    const updatedNode: WorkflowBuilderNode = {
      ...node,
      data: {
        ...node.data,
        meta: {
          chainId: chainId,
          chainName: nodeChainName,
          isBridge,
          chainType: nodeChainType,
        },
      },
    };
    updatedNodesMap.set(nodeId, updatedNode);

    // Determine chain context for downstream nodes
    const nextChainId = isBridge ? getOppositeChainId(chainId) : chainId;
    const nextChainType = isBridge ? ("destination" as const) : chainType;

    // Process all downstream nodes
    const downstream = adj.get(nodeId) || [];
    for (const childId of downstream) {
      processNodeChain(childId, nextChainId, nextChainType);
    }
  };

  // Find all root nodes (in-degree 0) and process each chain starting from sourceChainId
  const rootNodes = nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);

  for (const rootNode of rootNodes) {
    if (!visited.has(rootNode.id)) {
      // Each root starts fresh with sourceChainId
      processNodeChain(rootNode.id, sourceChainId, "source");
    }
  }

  // Handle any nodes not yet visited (shouldn't happen with valid graphs, but safety net)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      processNodeChain(node.id, sourceChainId, "source");
    }
  }

  // Return nodes in original order with updated metadata
  return nodes.map((n) => updatedNodesMap.get(n.id) || n);
};
