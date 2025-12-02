import { Handle } from "@xyflow/react";
import type { IconType, LayoutDirection } from "@/types/common";
import { memo, useMemo } from "react";
import {
  Collapsible,
  NodeDescription,
  NodeIcon,
  NodePanel,
  Status,
} from "@synergycodes/overflow-ui";
import { Icon } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHandleId } from "../../handles/get-handle-id";
import { getHandlePosition } from "../../handles/get-handle-position";

import { withOptionalComponentPlugins } from "@/features/plugins-core/adapters/adapter-components";
import type { NodeData } from "@/types/node-data";

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

    const iconElement = useMemo(() => <Icon name={icon} size="large" />, [icon]);

    const hasContent = !!children;

    const handlesAlignment = hasContent && layoutDirection === "horizontal" ? "header" : "center";

    const executionStatus = data?.executionStatus || "idle";

    return (
      <Collapsible>
        <div className="relative">
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

          <NodePanel.Root
            selected={selected}
            className={cn(
              "[--ax-public-node-gap:0] workflow-node-with-border relative transition-all duration-300",
              executionStatus === "success" && "!border-green-500 !ring-2 !ring-green-500/20",
              executionStatus === "error" && "!border-red-500 !ring-2 !ring-red-500/20",
              executionStatus === "running" && "!border-blue-500 ring-2 ring-blue-500/20"
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
            <NodePanel.Handles isVisible={showHandles} alignment={handlesAlignment}>
              <Handle id={handleTargetId} position={handleTargetPosition} type="target" />
              <Handle id={handleSourceId} position={handleSourcePosition} type="source" />
            </NodePanel.Handles>
          </NodePanel.Root>
        </div>
      </Collapsible>
    );
  }
);

export const WorkflowNodeTemplate = withOptionalComponentPlugins(
  WorkflowNodeTemplateComponent,
  "WorkflowNodeTemplate"
);
