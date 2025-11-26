import { ToastType, showToast } from "@/utils/toast-utils";
import { useEffect, useState } from "react";

import { useSingleSelectedElement } from "@/features/properties-bar/use-single-selected-element";
import { useRemoveElements } from "@/hooks/use-remove-elements";
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

  function handleRunNodeClick() {
    if (!selection?.node) {
      return;
    }

    const nodeLabel = selection.node.data?.properties?.label ?? "Selected node";

    showToast({
      title: `${nodeLabel} execution coming soon`,
      subtitle: "Node-level execution preview will be available soon.",
      variant: ToastType.INFO,
    });
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
