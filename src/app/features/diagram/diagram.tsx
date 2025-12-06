import useStore from "@/store/store";
import { useCallback, useEffect, useMemo } from "react";
import type { DragEventHandler } from "react";
import { diagramStateSelector } from "./selectors";

import {
  Background,
  type EdgeTypes,
  type FitViewOptions,
  type NodeChange,
  type OnBeforeDelete,
  type OnConnect,
  type OnConnectStart,
  type OnNodeDrag,
  type OnSelectionChangeParams,
  ReactFlow,
  SelectionMode,
} from "@xyflow/react";
import type { DragEvent } from "react";
import { getNodeTypesObject } from "./get-node-types-object";
import "@xyflow/react/dist/style.css";
import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";
import { SNAP_GRID, SNAP_IS_ACTIVE } from "@/features/diagram/diagram.const";
import {
  callNodeChangedListeners,
  destroyNodeChangedListeners,
} from "@/features/diagram/listeners/node-changed-listeners";
import { useDeleteConfirmation } from "@/features/modals/delete-confirmation/use-delete-confirmation";
import { withOptionalComponentPlugins } from "@/features/plugins-core/adapters/adapter-components";
import { usePaletteDrop } from "@/hooks/use-palette-drop";
import type { WorkflowBuilderOnSelectionChangeParams } from "@/types/common";
import type {
  WorkflowBuilderEdge,
  WorkflowBuilderNode,
} from "@/types/node-data";
import { LabelEdge } from "./edges/label-edge/label-edge";
import { TemporaryEdge } from "./edges/temporary-edge/temporary-edge";
import {
  callNodeDragStartListeners,
  destroyNodeDragStartListeners,
} from "./listeners/node-drag-start-listeners";
import { EmptyWorkflowPlaceholder } from "./components/empty-workflow-placeholder";
import { FloatingAIGenerator } from "./components/floating-ai-generator";

function DiagramContainerComponent({
  edgeTypes = {},
}: {
  edgeTypes?: EdgeTypes;
}) {
  const {
    nodes,
    edges,
    isReadOnlyMode,
    onNodesChange,
    onEdgesChange,
    onEdgeMouseEnter,
    onEdgeMouseLeave,
    onConnect: onConnectAction,
    onInit,
    onSelectionChange,
    canvasInteractionMode,
  } = useStore(diagramStateSelector);

  const { openDeleteConfirmationModal } = useDeleteConfirmation();

  const setConnectionBeingDragged = useStore(
    (store) => store.setConnectionBeingDragged
  );
  const togglePropertiesBar = useStore((store) => store.togglePropertiesBar);
  const nodeTypes = useMemo(getNodeTypesObject, []);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const { onDropFromPalette } = usePaletteDrop();

  const fitViewOptions: FitViewOptions = useMemo(() => ({ maxZoom: 1 }), []);

  const onNodeDragStart: OnNodeDrag = useCallback((event, node, nodes) => {
    trackFutureChange("nodeDragStart");
    callNodeDragStartListeners(event, node, nodes);
  }, []);

  const onDrop: DragEventHandler = useCallback(
    (event) => {
      trackFutureChange("addNode");
      onDropFromPalette(event);
    },
    [onDropFromPalette]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      trackFutureChange("addEdge");
      onConnectAction(connection);
    },
    [onConnectAction]
  );

  const onConnectStart: OnConnectStart = useCallback(
    (_event, { nodeId, handleId }) => {
      setConnectionBeingDragged(nodeId ?? null, handleId ?? null);
    },
    [setConnectionBeingDragged]
  );

  const onConnectEnd = useCallback(() => {
    setConnectionBeingDragged(null, null);
  }, [setConnectionBeingDragged]);

  const handleOnNodesChange = useCallback(
    (changes: NodeChange<WorkflowBuilderNode>[]) => {
      callNodeChangedListeners(changes);
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleOnSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      onSelectionChange(params as WorkflowBuilderOnSelectionChangeParams);
    },
    [onSelectionChange]
  );

  const onNodeDoubleClick = useCallback(() => {
    // Toggle properties panel on double-click
    togglePropertiesBar();
  }, [togglePropertiesBar]);

  useEffect(() => {
    destroyNodeChangedListeners();
    destroyNodeDragStartListeners();
  }, []);

  const diagramEdgeTypes = useMemo(
    () => ({ labelEdge: LabelEdge, ...edgeTypes }),
    [edgeTypes]
  );

  const onBeforeDelete: OnBeforeDelete<
    WorkflowBuilderNode,
    WorkflowBuilderEdge
  > = useCallback(
    async ({ nodes, edges }) => {
      if (isReadOnlyMode) {
        return false;
      }

      return new Promise((resolve) => {
        openDeleteConfirmationModal({
          nodes,
          edges,
          onDeleteClick: () => {
            trackFutureChange("delete");
            resolve(true);
          },
          onModalClosed: () => resolve(false),
        });
      });
    },
    [isReadOnlyMode, openDeleteConfirmationModal]
  );

  const isPanMode = canvasInteractionMode === "pan";
  const panOnDrag = isPanMode ? [0, 1, 2] : [1, 2];
  const selectionOnDrag = !isPanMode;

  const isWorkflowEmpty = nodes.length === 0;

  return (
    <div className="w-screen h-screen [&_.react-flow__edgelabel-renderer]:z-[1001]">
      <ReactFlow<WorkflowBuilderNode, WorkflowBuilderEdge>
        edges={edges}
        edgeTypes={diagramEdgeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        onDragOver={onDragOver}
        onInit={onInit}
        onDrop={onDrop}
        connectionLineComponent={TemporaryEdge}
        panOnScroll
        nodes={nodes}
        nodesConnectable={!isReadOnlyMode}
        nodesDraggable={!isReadOnlyMode}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onNodesChange={handleOnNodesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDoubleClick={onNodeDoubleClick}
        onBeforeDelete={onBeforeDelete}
        onSelectionChange={handleOnSelectionChange}
        minZoom={0.1}
        snapToGrid={SNAP_IS_ACTIVE}
        snapGrid={SNAP_GRID}
        selectionOnDrag={selectionOnDrag}
        panOnDrag={panOnDrag}
        selectionMode={SelectionMode.Partial}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        {isWorkflowEmpty && <EmptyWorkflowPlaceholder />}
      </ReactFlow>
      {/* AI Generation floating button - only show when not in read-only mode */}
      {!isReadOnlyMode && <FloatingAIGenerator />}
    </div>
  );
}

export const DiagramContainer = withOptionalComponentPlugins(
  DiagramContainerComponent,
  "DiagramContainer"
);
