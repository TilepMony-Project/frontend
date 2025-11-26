// Type definitions for node-data
// TODO: Replace with proper type definitions

import type { Node, Edge } from "@xyflow/react";

export type NodeData = Record<string, unknown>;

export type EdgeData = Record<string, unknown>;

export type WorkflowBuilderNode = Node<NodeData>;

export type WorkflowBuilderEdge = Edge<EdgeData>;
