import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";
import { getEdgeZIndex } from "@/features/diagram/edges/get-edge-z-index";
import type { GetDiagramState, SetDiagramState } from "@/store/store";
import type {
  ConnectionBeingDragged,
  DiagramModel,
  LayoutDirection,
  WorkflowBuilderReactFlowInstance,
} from "@/types/common";
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from "@/types/node-data";
import { getNodeWithErrors } from "@/utils/validation/get-node-errors";
import { updateNetworkMetadata } from "@/utils/network-utils";
import { type Connection, type Node, type OnConnect, addEdge } from "@xyflow/react";

export type DiagramState = {
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
  reactFlowInstance: WorkflowBuilderReactFlowInstance | null;
  documentName: string | null;
  isReadOnlyMode: boolean;
  layoutDirection: LayoutDirection;
  canvasInteractionMode: "select" | "pan";
  sourceChainId: number; // 5003 = Mantle Sepolia, 84532 = Base Sepolia
  onConnect: OnConnect;
  onInit: (instance: WorkflowBuilderReactFlowInstance) => void;
  setDocumentName: (name: string) => void;
  setDiagramModel: (model?: DiagramModel, options?: { skipIfNotEmpty?: boolean }) => void;
  setToggleReadOnlyMode: (value?: boolean) => void;
  setLayoutDirection: (value: LayoutDirection) => void;
  setCanvasInteractionMode: (mode: "select" | "pan") => void;
  setSourceChainId: (chainId: number) => void;
  setConnectionBeingDragged: (nodeId: string | null, handleId: string | null) => void;
  connectionBeingDragged: ConnectionBeingDragged | null;
  draggedSegmentDestinationId: string | null;
  setDraggedSegmentDestinationId: (id: string | null) => void;
  getNodes: () => Node[];
};

export function useDiagramSlice(set: SetDiagramState, get: GetDiagramState) {
  return {
    nodes: [],
    edges: [],
    reactFlowInstance: null,
    documentName: null,
    isReadOnlyMode: false,
    layoutDirection: "horizontal" as LayoutDirection,
    canvasInteractionMode: "select" as "select" | "pan",
    sourceChainId: 5003, // Default: Mantle Sepolia
    connectionBeingDragged: null,
    draggedSegmentDestinationId: null,
    onConnect: (connection: Connection) => {
      set({
        edges: addEdge(
          {
            ...connection,
            zIndex: getEdgeZIndex(connection),
            type: "labelEdge",
          },
          get().edges
        ),
      });
    },
    onInit: (instance: WorkflowBuilderReactFlowInstance) => {
      set({
        reactFlowInstance: instance,
      });
    },
    setDiagramModel: (model?: DiagramModel, options?: { skipIfNotEmpty?: boolean }) => {
      if (options?.skipIfNotEmpty) {
        const { documentName, nodes } = get();
        const isEmpty = !documentName && nodes.length === 0;

        if (!isEmpty) {
          return;
        }
      }

      const loadedNodes = model?.diagram?.nodes?.map(getNodeWithErrors) ?? [];
      const edges = model?.diagram?.edges ?? [];
      const documentName = model?.name || "Untitled";
      const layoutDirection = model?.layoutDirection || "horizontal";
      const { sourceChainId } = get();

      trackFutureChange("setDiagramModel");

      // Recalculate network metadata with current sourceChainId to ensure consistency
      const nodes = updateNetworkMetadata(loadedNodes, edges, sourceChainId);

      set({
        nodes,
        edges,
        layoutDirection,
        documentName,
      });
    },
    setDocumentName: (name: string) => {
      set({
        documentName: name,
      });
    },
    setToggleReadOnlyMode: (value?: boolean) => {
      set({
        isReadOnlyMode: value ?? !get().isReadOnlyMode,
      });
    },
    setLayoutDirection: (value: LayoutDirection) => {
      set({
        layoutDirection: value,
      });
    },
    setCanvasInteractionMode: (mode: "select" | "pan") => {
      set({
        canvasInteractionMode: mode,
      });
    },
    setSourceChainId: (chainId: number) => {
      const { nodes, edges } = get();
      set({
        sourceChainId: chainId,
        nodes: updateNetworkMetadata(nodes, edges, chainId),
      });
    },
    setConnectionBeingDragged: (nodeId: string | null, handleId: string | null) => {
      if (handleId && nodeId) {
        set({
          connectionBeingDragged: {
            handleId,
            nodeId,
          },
        });
      } else {
        set({
          connectionBeingDragged: null,
        });
      }
    },
    setDraggedSegmentDestinationId: (id: string | null) => {
      set({ draggedSegmentDestinationId: id });
    },
    getNodes: () => get().nodes,
  };
}
