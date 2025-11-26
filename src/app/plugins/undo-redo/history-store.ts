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
  let snapshotToRestore: DiagramSnapshot | null = null;

  useUndoRedoHistoryStore.setState((state) => {
    if (state.past.length === 0) {
      return state;
    }

    const previousSnapshot = state.past[state.past.length - 1];
    snapshotToRestore = deepCloneSnapshot(previousSnapshot);

    const updatedPast = state.past.slice(0, -1);
    const updatedFuture = [currentSnapshot, ...state.future];

    return {
      ...state,
      past: updatedPast,
      future: updatedFuture,
    };
  });

  if (snapshotToRestore) {
    useStore.setState({
      nodes: snapshotToRestore.nodes,
      edges: snapshotToRestore.edges,
    });
  }
}

export function redoWorkflowStep() {
  const currentSnapshot = getCurrentSnapshot();
  let snapshotToRestore: DiagramSnapshot | null = null;

  useUndoRedoHistoryStore.setState((state) => {
    if (state.future.length === 0) {
      return state;
    }

    const [nextSnapshot, ...remainingFuture] = state.future;
    snapshotToRestore = deepCloneSnapshot(nextSnapshot);

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

  if (snapshotToRestore) {
    useStore.setState({
      nodes: snapshotToRestore.nodes,
      edges: snapshotToRestore.edges,
    });
  }
}

export function canUndo() {
  return useUndoRedoHistoryStore.getState().past.length > 0;
}

export function canRedo() {
  return useUndoRedoHistoryStore.getState().future.length > 0;
}
