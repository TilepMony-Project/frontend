// Type definitions for common types
// TODO: Replace with proper type definitions

import type { ReactFlowInstance, Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'horizontal' | 'vertical';

export const layoutDirections: LayoutDirection[] = ['horizontal', 'vertical'];

export enum StatusType {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export type IconType = string;

export type DraggingItem = {
  type: string;
  [key: string]: unknown;
};

export type PaletteItem<T = unknown> = {
  label: string;
  description: string;
  type: string;
  icon: string | IconType;
  defaultPropertiesData?: T;
  schema?: unknown;
  uischema?: unknown;
  [key: string]: unknown;
};

export type DiagramModel = {
  nodes: unknown[];
  edges: unknown[];
  [key: string]: unknown;
};

export type TemplateModel = {
  name: string;
  description?: string;
  icon?: string;
  diagram: DiagramModel;
  [key: string]: unknown;
};

export type WorkflowBuilderReactFlowInstance = ReactFlowInstance<Node, Edge>;

export type ConnectionBeingDragged = {
  nodeId: string;
  handleId: string;
};

export type WorkflowBuilderOnSelectionChangeParams = {
  nodes: unknown[];
  edges: unknown[];
};

