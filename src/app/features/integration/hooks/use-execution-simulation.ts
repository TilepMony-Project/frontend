import { useCallback } from "react";
import useStore from "@/store/store";
import { showToast, ToastType } from "@/utils/toast-utils";
import type { WorkflowBuilderNode } from "@/types/node-data";

export function useExecutionSimulation() {
  const nodes = useStore((state) => state.nodes);
  const setNodeData = useStore((state) => state.setNodeData);

  const runNode = useCallback(
    async (nodeId: string) => {
      // Set status to running
      setNodeData(nodeId, { executionStatus: "running" });

      // Simulate delay (1-3 seconds)
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Random success/error (90% success)
      const isSuccess = Math.random() > 0.1;
      const status = isSuccess ? "success" : "error";

      setNodeData(nodeId, { executionStatus: status });
    },
    [setNodeData]
  );

  const runWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      showToast({
        title: "Empty Workflow",
        subtitle: "Add nodes to run the workflow.",
        variant: ToastType.INFO,
      });
      return;
    }

    // Reset all nodes to idle first
    nodes.forEach((node) => {
      setNodeData(node.id, { executionStatus: "idle" });
    });

    // Simple sequential execution simulation
    // In a real app, this would follow the edges
    for (const node of nodes) {
      await runNode(node.id);

      // If a node fails, stop execution (optional, but realistic)
      // For now, we'll continue to show full flow simulation
    }
  }, [nodes, runNode, setNodeData]);

  return {
    runNode,
    runWorkflow,
  };
}
