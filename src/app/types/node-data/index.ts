// Type definitions for node-data
// TODO: Replace with proper type definitions

import type { Node, Edge } from "@xyflow/react";
import type { IconType } from "@/types/common";

export type NodePropertiesData = Record<string, unknown>;

export type NodeData = {
  icon?: IconType;
  properties?: NodePropertiesData;
  [key: string]: unknown;
};

export type EdgeData = {
  label?: string;
  icon?: IconType;
  [key: string]: unknown;
};

export type WorkflowBuilderNode = Node<NodeData>;

export type WorkflowBuilderEdge = Edge<EdgeData>;
