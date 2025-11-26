import type { LayoutDirection } from "@/types/common";
import { type HandleType, Position } from "@xyflow/react";

export function getHandlePosition({ handleType, direction }: GetHandlePositionOptions) {
  return HANDLE_POSITION_MAP[`${handleType}-${direction}`];
}

const HANDLE_POSITION_MAP: Record<`${HandleType}-${LayoutDirection}`, Position> = {
  "source-vertical": Position.Bottom,
  "source-horizontal": Position.Right,
  "target-vertical": Position.Top,
  "target-horizontal": Position.Left,
};

type GetHandlePositionOptions = {
  handleType: HandleType;
  direction: LayoutDirection;
};
