import { NodeType } from "@/types/node-types";
import type { NodeTypes } from "@xyflow/react";
import { NodeContainer } from "./nodes/node-container";

export function getNodeTypesObject(): NodeTypes {
  return {
    [NodeType.Node]: NodeContainer,
  };
}
