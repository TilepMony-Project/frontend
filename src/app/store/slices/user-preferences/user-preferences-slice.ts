import type { GetDiagramState, SetDiagramState } from "@/store/store";

export type UserPreferencesState = {
  shouldSkipShowingConfirmation: boolean;
  isExecutionMonitorActive: boolean;
  isPropertiesBarExpanded: boolean;
  lastExecutionRun: number | null;
  executionLogs: string[];
  executionStatus: string;
  estimatedGasCost: string | null;
  setShouldSkipShowDeleteConfirmation: (value: boolean) => void;
  setExecutionMonitorActive: (value: boolean) => void;
  setLastExecutionRun: (value: number) => void;
  setExecutionLogs: (logs: string[] | ((prev: string[]) => string[])) => void;
  setExecutionStatus: (status: string) => void;
  setEstimatedGasCost: (cost: string | null) => void;
  togglePropertiesBar: (value?: boolean) => void;
};

export function useUserPreferencesSlice(
  set: SetDiagramState,
  get: GetDiagramState
): UserPreferencesState {
  return {
    shouldSkipShowingConfirmation: false,
    isExecutionMonitorActive: false,
    isPropertiesBarExpanded: true,
    lastExecutionRun: null,
    executionLogs: [],
    executionStatus: "idle",
    estimatedGasCost: null,
    setShouldSkipShowDeleteConfirmation: (value: boolean) => {
      set((state) => ({
        ...state,
        shouldSkipShowingConfirmation: value,
      }));
    },
    setExecutionMonitorActive: (value: boolean) => {
      set((state) => ({
        ...state,
        isExecutionMonitorActive: value,
      }));
    },
    setLastExecutionRun: (value: number) => {
      set((state) => ({
        ...state,
        lastExecutionRun: value,
      }));
    },
    setExecutionLogs: (logs) => {
      set((state) => ({
        ...state,
        executionLogs: typeof logs === "function" ? logs(state.executionLogs) : logs,
      }));
    },
    setExecutionStatus: (status: string) => {
      set((state) => ({
        ...state,
        executionStatus: status,
      }));
    },
    setEstimatedGasCost: (cost: string | null) => {
      set((state) => ({
        ...state,
        estimatedGasCost: cost,
      }));
    },
    togglePropertiesBar: (value) => {
      set({
        isPropertiesBarExpanded: value ?? !get().isPropertiesBarExpanded,
      });
    },
  };
}
