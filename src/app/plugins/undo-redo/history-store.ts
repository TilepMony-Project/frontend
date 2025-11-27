import { create } from "zustand";

import useStore from "@/store/store";
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from "@/types/node-data";

type DiagramSnapshot = {
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
};

type UndoRedoHistoryState = {
  past: DiagramSnapshot[];
  future: DiagramSnapshot[];
  limit: number;
};

const MAX_HISTORY = 50;

export const useUndoRedoHistoryStore = create<UndoRedoHistoryState>(() => ({
  past: [],
  future: [],
  limit: MAX_HISTORY,
}));

function deepCloneSnapshot(snapshot: DiagramSnapshot): DiagramSnapshot {
  if (typeof structuredClone === "function") {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as DiagramSnapshot;
}

function getCurrentSnapshot(): DiagramSnapshot {
  const state = useStore.getState();
  return deepCloneSnapshot({
    nodes: state.nodes,
    edges: state.edges,
  });
}

export function captureSnapshot() {
  const snapshot = getCurrentSnapshot();

  useUndoRedoHistoryStore.setState((state) => {
    const updatedPast = [...state.past, snapshot];
    if (updatedPast.length > state.limit) {
      updatedPast.splice(0, updatedPast.length - state.limit);
    }

    return {
      ...state,
      past: updatedPast,
      future: [],
    };
  });
}

export function undoWorkflowStep() {
  const currentSnapshot = getCurrentSnapshot();
  const historyState = useUndoRedoHistoryStore.getState();

  if (historyState.past.length === 0) {
    return;
  }

  const snapshotToRestore = deepCloneSnapshot(
    historyState.past[historyState.past.length - 1]
  );

  useUndoRedoHistoryStore.setState((state) => {
    const updatedPast = state.past.slice(0, -1);
    const updatedFuture = [currentSnapshot, ...state.future];

    return {
      ...state,
      past: updatedPast,
      future: updatedFuture,
    };
  });

  useStore.setState({
    nodes: snapshotToRestore.nodes,
    edges: snapshotToRestore.edges,
  });
}

export function redoWorkflowStep() {
  const currentSnapshot = getCurrentSnapshot();
  const historyState = useUndoRedoHistoryStore.getState();

  if (historyState.future.length === 0) {
    return;
  }

  const [nextSnapshot, ...remainingFuture] = historyState.future;
  const snapshotToRestore = deepCloneSnapshot(nextSnapshot);

  useUndoRedoHistoryStore.setState((state) => {
    const updatedPast = [...state.past, currentSnapshot];
    if (updatedPast.length > state.limit) {
      updatedPast.splice(0, updatedPast.length - state.limit);
    }

    return {
      ...state,
      past: updatedPast,
      future: remainingFuture,
    };
  });

  useStore.setState({
    nodes: snapshotToRestore.nodes,
    edges: snapshotToRestore.edges,
  });
}

export function canUndo() {
  return useUndoRedoHistoryStore.getState().past.length > 0;
}

export function canRedo() {
  return useUndoRedoHistoryStore.getState().future.length > 0;
}
