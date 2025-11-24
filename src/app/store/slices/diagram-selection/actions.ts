// About actions: apps/frontend/src/app/store/README.md
import type { OnSelectionChangeParams } from '@xyflow/react';
import useStore from '@/store/store';
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from '@/types/node-data';

export function getStoreSelection(): OnSelectionChangeParams {
  const state = useStore.getState();

  const selectedNodes = state.selectedNodesIds
    .map((nodeId) => state.nodes.find(({ id }) => id === nodeId))
    .filter((value): value is WorkflowBuilderNode => !!value);

  const selectedEdges = state.selectedEdgesIds
    .map((edgeId) => state.edges.find(({ id }) => id === edgeId))
    .filter((value): value is WorkflowBuilderEdge => !!value);

  return {
    nodes: selectedNodes,
    edges: selectedEdges,
  };
}

export function resetStoreSelection() {
  useStore.setState({
    selectedNodesIds: [],
    selectedEdgesIds: [],
  });
}
