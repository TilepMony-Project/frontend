import { Icon } from "@/components/icons";
import type { WorkflowBuilderEdge } from "@/types/node-data";
import { BaseEdge, type EdgeProps, getSmoothStepPath, useReactFlow } from "@xyflow/react";
import { EdgeLabel } from "../edge-label-renderer/edge-label-renderer";
import { EDGE_CURVE_RADIUS, EDGE_OFFSET, SELF_CONNECTING_EDGE_LABEL_OFFSET } from "../edge.consts";
import { SelfConnectingEdge } from "../self-connecting-edge/self-connecting-edge";
import { useLabelEdgeHover } from "./use-label-edge-hover";

export function LabelEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  selected,
  source,
  target,
}: EdgeProps<WorkflowBuilderEdge>) {
  const { getNode } = useReactFlow();
  const { style, hovered, onMouseEnter, onMouseLeave } = useLabelEdgeHover({
    id,
    isSelected: selected,
  });

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: EDGE_CURVE_RADIUS,
    offset: EDGE_OFFSET,
  });

  const { label, icon } = data;
  const labelText = typeof label === "string" ? label : undefined;
  const iconName = typeof icon === "string" ? icon : undefined;
  const content = iconName ? <Icon name={iconName} /> : labelText;

  const labelProps = {
    id,
    content,
    hovered,
    selected,
    icon: iconName,
    onMouseEnter,
    onMouseLeave,
  };

  if (source === target) {
    const sourceNode = getNode(source);
    const nodeHeight = sourceNode?.height ?? 0;
    const selfConnectingLabelY = sourceY - (nodeHeight + SELF_CONNECTING_EDGE_LABEL_OFFSET);

    return (
      <>
        <SelfConnectingEdge
          id={id}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          selected={selected}
          hovered={hovered}
          source={source}
          target={target}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
        />
        <EdgeLabel {...labelProps} labelX={labelX} labelY={selfConnectingLabelY} />
      </>
    );
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabel {...labelProps} labelX={labelX} labelY={labelY} />
    </>
  );
}
