import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { memo, useMemo } from "react";
import {
  Collapsible,
  NodeDescription,
  NodeIcon,
  NodePanel,
} from "@synergycodes/overflow-ui";
import { Icon } from "@/components/icons";

type LandingPageNode = Node<{
  icon?: string;
  properties?: {
    label?: string;
    description?: string;
  };
}>;

type LandingPageNodeProps = NodeProps<LandingPageNode>;

export const LandingPageNode = memo(({ data, selected }: LandingPageNodeProps) => {
  const { icon, properties } = data;
  const label = typeof properties?.label === "string" ? properties.label : "Node";
  const description =
    typeof properties?.description === "string" ? properties.description : "";
  const iconName = icon ?? "Circle";

  const iconElement = useMemo(() => <Icon name={iconName} size="large" />, [iconName]);

  return (
    <Collapsible>
      <NodePanel.Root
        selected={selected}
        className="[--ax-public-node-gap:0] workflow-node-with-border min-w-[280px]"
      >
        <NodePanel.Header>
          <NodeIcon icon={iconElement} />
          <NodeDescription label={label} description={description} />
        </NodePanel.Header>
        
        <NodePanel.Handles isVisible={true} alignment="center">
          <Handle
            id="target"
            type="target"
            position={Position.Left}
            className="!bg-gray-400 dark:!bg-gray-500"
          />
          <Handle
            id="source"
            type="source"
            position={Position.Right}
            className="!bg-gray-400 dark:!bg-gray-500"
          />
        </NodePanel.Handles>
      </NodePanel.Root>
    </Collapsible>
  );
});

LandingPageNode.displayName = "LandingPageNode";
