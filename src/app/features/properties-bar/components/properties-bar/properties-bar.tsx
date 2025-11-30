import clsx from "clsx";

import { Icon } from "@/components/icons";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Button } from "@/components/ui/button";
import { SegmentPicker } from "@/components/ui/segment-picker";
import { withOptionalComponentPlugins } from "@/features/plugins-core/adapters/adapter-components";
import { EdgeProperties } from "../edge-properties/edge-properties";
import { PropertiesBarHeader } from "../header/properties-bar-header";
import { NodeProperties } from "../node-properties/node-properties";
import type { PropertiesBarItem, PropertiesBarProps } from "./properties-bar.types";
import { renderComponent } from "./render-component";

/**
 * PropertiesBarComponent - A configurable sidebar component for displaying and editing
 * properties of selected workflow elements (nodes and edges).
 *
 * This component provides a flexible tab-based interface that can be extended with custom tabs.
 * By default, it shows a "Properties" tab for basic element properties. Additional tabs can be
 * added through the `tabs` prop to extend functionality.
 * When no custom tabs exist, the SegmentPicker is hidden for a cleaner UI
 */
function PropertiesBarComponent({
  selection,
  onMenuHeaderClick,
  onDeleteClick,
  headerLabel,
  deleteNodeLabel,
  deleteEdgeLabel,
  selectedTab,
  onTabChange,
  onRunNodeClick,
  runNodeLabel,
  tabs = [],
  isSidebarExpanded,
  onToggleSidebar,
}: PropertiesBarProps) {
  const name = getSelectionName(selection);
  const hasSelection = !!selection;
  const isExpanded = hasSelection && isSidebarExpanded;
  const hasCustomItems = tabs.length > 0;

  const segmentPicker = {
    when: () => isExpanded && !!selection?.node && selection.node.type === "node" && hasCustomItems,
    component: () => (
      <SegmentPicker
        size="xxx-small"
        value={selectedTab}
        onChange={(_, value) => onTabChange(value)}
      >
        {[
          <SegmentPicker.Item key="properties" value="properties">
            Properties
          </SegmentPicker.Item>,
          ...tabs.map(({ label, value }) => (
            <SegmentPicker.Item key={value} value={value}>
              {label}
            </SegmentPicker.Item>
          )),
        ]}
      </SegmentPicker>
    ),
  };

  const contentComponents: PropertiesBarItem[] = [
    {
      when: ({ selection, selectedTab }) => !!selection.node && selectedTab === "properties",
      component: ({ selection }) =>
        selection?.node ? <NodeProperties node={selection.node} /> : null,
    },
    {
      when: ({ selection }) => !!selection.edge,
      component: ({ selection }) =>
        selection?.edge ? <EdgeProperties edge={selection.edge} /> : null,
    },
    ...tabs.flatMap((tab) => tab.components),
  ];

  return (
    <Sidebar
      className={clsx(isExpanded && "!w-[420px] !h-[500px]")}
      isExpanded={isExpanded}
      contentClassName="-ml-4 w-[calc(100%+1rem)] [&>*]:pl-4"
      header={
        <>
          <PropertiesBarHeader
            isExpanded={isExpanded}
            header={headerLabel}
            name={name ?? ""}
            onDotsClick={onMenuHeaderClick}
            onToggleExpand={hasSelection ? onToggleSidebar : undefined}
            isSidebarExpanded={isSidebarExpanded}
          />
          {isExpanded && renderComponent([segmentPicker], selection, selectedTab)}
        </>
      }
      footer={
        isExpanded && (
          <div className="flex flex-col gap-2 w-full">
            {selection?.node && (
              <Button
                onClick={onRunNodeClick}
                variant="default"
                className="h-10 bg-green-500 hover:bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200 font-medium text-sm"
              >
                <Icon name="Play" size={16} />
                {runNodeLabel}
              </Button>
            )}
            <Button
              onClick={onDeleteClick}
              variant="outline"
              className="h-10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors duration-200 font-medium text-sm"
            >
              <Icon name="Trash2" size={16} />
              {selection?.node ? deleteNodeLabel : deleteEdgeLabel}
            </Button>
          </div>
        )
      }
    >
      {isExpanded && renderComponent(contentComponents, selection, selectedTab)}
    </Sidebar>
  );
}

export const PropertiesBar = withOptionalComponentPlugins(PropertiesBarComponent, "PropertiesBar");

function getSelectionName(selection: PropertiesBarProps["selection"]): string {
  if (!selection) {
    return "";
  }

  const nodeProperties = selection.node?.data?.properties;
  const nodeLabel =
    isRecord(nodeProperties) && typeof nodeProperties.label === "string"
      ? nodeProperties.label
      : undefined;

  const edgeLabelValue = selection.edge?.data?.label;
  const edgeLabel = typeof edgeLabelValue === "string" ? edgeLabelValue : undefined;

  return nodeLabel ?? edgeLabel ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
