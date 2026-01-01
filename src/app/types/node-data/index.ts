// Type definitions for node-data
// TODO: Replace with proper type definitions

import type { IconType } from "@/types/common";
import type { Edge, Node } from "@xyflow/react";

export type NodePropertiesData = Record<string, unknown>;

export type ExecutionStatus = "idle" | "running" | "success" | "error";

export type NodeData = {
  icon?: IconType;
  properties?: NodePropertiesData;
  executionStatus?: ExecutionStatus;
  [key: string]: unknown;
};

export type EdgeData = {
  label?: string;
  icon?: IconType;
  [key: string]: unknown;
};

export type WorkflowBuilderNode = Node<NodeData>;

export type WorkflowBuilderEdge = Edge<EdgeData>;
