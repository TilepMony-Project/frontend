import type { NodeData, WorkflowBuilderNode } from '@/types/node-data';
import type { NodeAddChange, XYPosition } from '@xyflow/react';
import type { NodeType } from '@/types/node-types';

export function getNodeAddChange(
  templateType: NodeType,
  position: XYPosition | undefined,
  data: NodeData,
  id: string
): NodeAddChange<WorkflowBuilderNode>[] {
  return [
    {
      type: 'add',
      item: {
        id,
        type: templateType,
        position: position ?? { x: 0, y: 0 },
        data: {
          segments: [],
          ...data,
        },
        selected: true,
      },
    },
  ];
}
