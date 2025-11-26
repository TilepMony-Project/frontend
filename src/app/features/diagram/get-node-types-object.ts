import { NodeType } from "@/types/node-types";
import { NodeContainer } from "./nodes/node-container";
import type { NodeTypes } from "@xyflow/react";

export function getNodeTypesObject(): NodeTypes {
  return {
    [NodeType.Node]: NodeContainer,
  };
}
