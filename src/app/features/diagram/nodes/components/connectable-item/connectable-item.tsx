import { Handle, type HandleType, Position } from "@xyflow/react";

import { getHandleId } from "@/features/diagram/handles/get-handle-id";
import useStore from "@/store/store";
import clsx from "clsx";

type Props = {
  nodeId: string;
  innerId: string;
  handleType: HandleType;
  label: string;
  canHaveBottomHandle?: boolean;
};

export function ConnectableItem({
  label,
  nodeId,
  innerId,
  handleType,
  canHaveBottomHandle = true,
}: Props) {
  const layoutDirection = useStore(({ layoutDirection }) => layoutDirection);
  const isVertical = layoutDirection === "vertical" && canHaveBottomHandle;
  const position = isVertical ? Position.Bottom : Position.Right;

  const handleId = getHandleId({ nodeId, innerId, handleType });

  return (
    <div className="ax-public-p11 relative flex py-[var(--wb-connectable-item-vertical-padding)] px-[var(--wb-connectable-item-horizontal-padding)] bg-[var(--wb-connectable-item-background)] border-[length:var(--wb-connectable-item-border-width)] border-[var(--wb-connectable-item-border-color)] rounded-[var(--wb-connectable-item-border-radius)] justify-between">
      {label}
      <div
        className={clsx("relative", isVertical && "absolute bottom-0 left-1/2 -translate-x-1/2")}
      >
        <Handle id={handleId} position={position} type="source" />
      </div>
    </div>
  );
}
