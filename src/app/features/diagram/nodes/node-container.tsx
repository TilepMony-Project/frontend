import useStore from "@/store/store";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { WorkflowBuilderNode } from "@/types/node-data";
import { WorkflowNodeTemplate } from "./workflow-node-template/workflow-node-template";
import { NodeAsPortWrapper } from "@synergycodes/overflow-ui";
import { getHandlePosition } from "../handles/get-handle-position";
import { getIsValidFromProperties } from "@/utils/validation/get-is-valid-from-properties";
import { resolveDynamicNodeIcon } from "@/utils/resolve-dynamic-node-icon";

type Props = NodeProps<WorkflowBuilderNode>;

export const NodeContainer = memo(({ id, data, selected }: Props) => {
  const { icon, properties, type } = data;
  const label = typeof properties?.label === "string" ? properties.label : "";
  const description =
    typeof properties?.description === "string" ? properties.description : "";
  const defaultIcon = icon ?? "Circle";
  // Use dynamic icon based on selected property (e.g., swap provider, issuer)
  const iconName = resolveDynamicNodeIcon(
    typeof type === "string" ? type : undefined,
    properties,
    defaultIcon
  );
  const isValid = getIsValidFromProperties(properties);

  const layoutDirection = useStore((store) => store.layoutDirection);
  const handleTargetPosition = getHandlePosition({
    direction: layoutDirection,
    handleType: "target",
  });
  const connectionBeingDragged = useStore(
    (store) => store.connectionBeingDragged
  );

  const nodeType = typeof type === "string" ? type : undefined;
  // Deposit: Output only (Right only) -> Hide Target
  const hideTargetHandle = nodeType === "deposit";
  // Redeem & Transfer: Input only (Left only) -> Hide Source
  const hideSourceHandle = nodeType === "redeem" || nodeType === "transfer";

  return (
    <NodeAsPortWrapper
      isConnecting={!!connectionBeingDragged}
      targetPortPosition={handleTargetPosition}
    >
      <WorkflowNodeTemplate
        id={id}
        selected={selected}
        layoutDirection={layoutDirection}
        data={data}
        label={label}
        description={description}
        icon={iconName}
        isValid={isValid}
        hideTargetHandle={hideTargetHandle}
        hideSourceHandle={hideSourceHandle}
      />
    </NodeAsPortWrapper>
  );
});
