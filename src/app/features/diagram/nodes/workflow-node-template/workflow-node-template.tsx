import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import useStore from "@/store/store";
import type { IconType, LayoutDirection } from "@/types/common";
import {
  Collapsible,
  NodeDescription,
  NodeIcon,
  NodePanel,
  Status,
} from "@synergycodes/overflow-ui";
import { Handle } from "@xyflow/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { memo, useMemo } from "react";
import { getHandleId } from "../../handles/get-handle-id";
import { getHandlePosition } from "../../handles/get-handle-position";

import { withOptionalComponentPlugins } from "@/features/plugins-core/adapters/adapter-components";
import type { NodeData } from "@/types/node-data";
import { AddNodeButton } from "../components/add-node-button/add-node-button";

export type WorkflowNodeTemplateProps = {
  id: string;
  icon: IconType;
  label: string;
  description: string;
  data?: NodeData;
  selected?: boolean;
  layoutDirection?: LayoutDirection;
  isConnecting?: boolean;
  showHandles?: boolean;
  isValid?: boolean;
  children?: React.ReactNode;
  hideTargetHandle?: boolean;
  hideSourceHandle?: boolean;
};

const WorkflowNodeTemplateComponent = memo(
  ({
    id,
    icon,
    label,
    description,
    data,
    layoutDirection = "horizontal",
    selected = false,
    showHandles = true,
    isValid,
    children,
    hideTargetHandle = false,
    hideSourceHandle = false,
  }: WorkflowNodeTemplateProps) => {
    const handleTargetId = getHandleId({ nodeId: id, handleType: "target" });
    const handleSourceId = getHandleId({ nodeId: id, handleType: "source" });

    const handleTargetPosition = getHandlePosition({
      direction: layoutDirection,
      handleType: "target",
    });
    const handleSourcePosition = getHandlePosition({
      direction: layoutDirection,
      handleType: "source",
    });

    const iconElement = useMemo(
      () => <Icon name={icon} size="large" />,
      [icon]
    );

    const hasContent = !!children;

    const handlesAlignment =
      hasContent && layoutDirection === "horizontal" ? "header" : "center";

    const executionStatus = data?.executionStatus || "idle";

    // Check for bridge destination conflict
    const sourceChainId = useStore((state) => state.sourceChainId);
    const isBridgeNode = data?.type === "bridge";
    const bridgeDestinationChain = data?.properties?.destinationChain as number | undefined;
    
    // Bridge conflict: destination chain is same as source chain
    const hasBridgeConflict = isBridgeNode && 
      bridgeDestinationChain !== undefined && 
      bridgeDestinationChain === sourceChainId;

    // Get chain name for warning message
    const getChainName = (chainId: number) => {
      if (chainId === 5003) return "Mantle Sepolia";
      if (chainId === 84532) return "Base Sepolia";
      return `Chain ${chainId}`;
    };

    return (
      <Collapsible>
        {/* Added 'group' class to enable hover effect for AddNodeButton */}
        <div className="relative group">
          {executionStatus === "running" && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
                <div className="bg-gray-200 dark:bg-gray-300 text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap ring-2 ring-white dark:ring-[#1b1b1d]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  PROCESSING
                </div>
              </div>
              <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-[0.5px] rounded-xl pointer-events-none" />
            </>
          )}

          {/* Bridge Destination Conflict Warning */}
          {hasBridgeConflict && (
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/70 dark:text-yellow-200 dark:border-yellow-700 shadow-md"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold whitespace-nowrap">
                <AlertTriangle className="h-3 w-3" />
                <span>Invalid: Can&apos;t bridge to {getChainName(bridgeDestinationChain!)}</span>
              </div>
              <div className="text-[9px] text-yellow-700 dark:text-yellow-300 mt-0.5">
                Source is also {getChainName(sourceChainId)}. Update destination.
              </div>
            </div>
          )}

          {/* Network Badge */}
          {data?.meta?.chainName && (
            <div
              className={cn(
                "absolute -top-2.5 right-4 z-40 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border",
                data.meta.isBridge
                  ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800"
                  : data.meta.chainType === "destination"
                  ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800"
                  : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800"
              )}
            >
              {data.meta.chainName}
            </div>
          )}

          <NodePanel.Root
            selected={selected}
            className={cn(
              "[--ax-public-node-gap:0] workflow-node-with-border relative transition-all duration-300",
              executionStatus === "success" &&
                "!border-green-500 !ring-2 !ring-green-500/20",
              executionStatus === "error" &&
                "!border-red-500 !ring-2 !ring-red-500/20",
              executionStatus === "running" &&
                "!border-blue-500 ring-2 ring-blue-500/20",
              // Yellow border for bridge conflict
              hasBridgeConflict &&
                "!border-yellow-400 ring-2 ring-yellow-400/30 dark:!border-yellow-500"
            )}
          >
            <NodePanel.Header>
              <NodeIcon icon={iconElement} />
              <div className="node-description-wrapper">
                <NodeDescription label={label} description={description} />
              </div>
              {hasContent && <Collapsible.Button />}
            </NodePanel.Header>
            <NodePanel.Content>
              <Status status={isValid === false ? "invalid" : undefined} />
              <Collapsible.Content>
                <div className="pt-2">{children}</div>
              </Collapsible.Content>
            </NodePanel.Content>
            <NodePanel.Handles
              isVisible={showHandles}
              alignment={handlesAlignment}
            >
              {!hideTargetHandle && (
                <Handle
                  id={handleTargetId}
                  position={handleTargetPosition}
                  type="target"
                />
              )}
              {!hideSourceHandle && (
                <Handle
                  id={handleSourceId}
                  position={handleSourcePosition}
                  type="source"
                />
              )}
            </NodePanel.Handles>
          </NodePanel.Root>

          {/* Add Node Button - appears on hover, opens Nodes Library */}
          {[
            "yield-deposit",
            "yield-withdraw",
            "swap",
            "mint",
            "transfer",
          ].includes(typeof data?.type === "string" ? data.type : "") ? (
            <>
              <AddNodeButton
                nodeId={id}
                layoutDirection={layoutDirection}
                side="left"
              />
              <AddNodeButton
                nodeId={id}
                layoutDirection={layoutDirection}
                side="right"
              />
            </>
          ) : (
            <AddNodeButton
              nodeId={id}
              layoutDirection={layoutDirection}
              side={hideSourceHandle ? "left" : "right"}
            />
          )}
        </div>
      </Collapsible>
    );
  }
);

export const WorkflowNodeTemplate = withOptionalComponentPlugins(
  WorkflowNodeTemplateComponent,
  "WorkflowNodeTemplate"
);
