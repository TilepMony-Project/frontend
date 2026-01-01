import { IntegrationContext } from "@/features/integration/components/integration-variants/context/integration-context-wrapper";
import { ToastType, showToast } from "@/utils/toast-utils";
import { useContext, useEffect, useState } from "react";

import { useSingleSelectedElement } from "@/features/properties-bar/use-single-selected-element";
import { useRemoveElements } from "@/hooks/use-remove-elements";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import useStore from "@/store/store";

import { PropertiesBar } from "./components/properties-bar/properties-bar";

export function PropertiesBarContainer() {
  const { removeElements } = useRemoveElements();
  const isPropertiesBarExpanded = useStore((state) => state.isPropertiesBarExpanded);
  const togglePropertiesBar = useStore((state) => state.togglePropertiesBar);

  const [selectedTab, setSelectedTab] = useState("properties");

  const selection = useSingleSelectedElement();
  useEffect(() => {
    if (selection?.node || selection?.edge || selection === null) {
      setSelectedTab("properties");
    }
  }, [selection]);

  function handleDeleteClick() {
    if (selection) {
      removeElements(selection);
    }
  }

  const setNodeData = useStore((state) => state.setNodeData);

  const { executeWorkflow } = useWorkflowExecution();
  const { onSave } = useContext(IntegrationContext);

  async function handleRunNodeClick() {
    if (!selection?.node) {
      return;
    }

    const workflowId = localStorage.getItem("tilepmoney_current_workflow_id");
    if (!workflowId) {
      showToast({
        title: "Error",
        subtitle: "Workflow ID not found.",
        variant: ToastType.ERROR,
      });
      return;
    }

    const node = selection.node;
    const nodeLabel = getNodeLabel(node.data?.properties);

    // 0. Auto-save first
    const saveResult = await onSave({ isAutoSave: false });
    if (saveResult === "error") {
      showToast({
        title: "Save Failed",
        subtitle: "Failed to save workflow before running node.",
        variant: ToastType.ERROR,
      });
      return;
    }

    try {
      await executeWorkflow(workflowId, node.id);

      showToast({
        title: "Execution Started",
        subtitle: `${nodeLabel} execution initiated successfully.`,
        variant: ToastType.SUCCESS,
      });
    } catch (error: any) {
      showToast({
        title: "Execution Failed",
        subtitle: error.message || `${nodeLabel} execution failed to start.`,
        variant: ToastType.ERROR,
      });
    }
  }

  return (
    <PropertiesBar
      selection={selection}
      onDeleteClick={handleDeleteClick}
      onRunNodeClick={handleRunNodeClick}
      headerLabel="Properties"
      deleteNodeLabel="Delete Node"
      deleteEdgeLabel="Delete Edge"
      runNodeLabel="Run Node"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      isSidebarExpanded={isPropertiesBarExpanded}
      onToggleSidebar={togglePropertiesBar}
    />
  );
}

function getNodeLabel(properties: unknown): string {
  if (isRecord(properties) && typeof properties.label === "string") {
    return properties.label;
  }

  return "Selected node";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
