// Type definitions for common types
// TODO: Replace with proper type definitions

import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";
import type { NodeType } from "@/types/node-types";
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from "@/types/node-data";

export type LayoutDirection = "horizontal" | "vertical";

export const layoutDirections: LayoutDirection[] = ["horizontal", "vertical"];

export enum StatusType {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
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
  templateType?: NodeType;
  defaultPropertiesData?: T;
  schema?: unknown;
  uischema?: unknown;
  [key: string]: unknown;
};

export type DiagramModel = {
  name?: string;
  layoutDirection?: LayoutDirection;
  diagram?: {
    nodes: WorkflowBuilderNode[];
    edges: WorkflowBuilderEdge[];
  };
  [key: string]: unknown;
};

export type WorkflowBuilderReactFlowInstance = ReactFlowInstance<Node, Edge>;

export type ConnectionBeingDragged = {
  nodeId: string;
  handleId: string;
};

export type WorkflowBuilderOnSelectionChangeParams = {
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
};
