import type { GetDiagramState, SetDiagramState } from "@/store/store";

export type UserPreferencesState = {
  shouldSkipShowingConfirmation: boolean;
  isExecutionMonitorActive: boolean;
  isPropertiesBarExpanded: boolean;
  lastExecutionRun: number | null;
  setShouldSkipShowDeleteConfirmation: (value: boolean) => void;
  setExecutionMonitorActive: (value: boolean) => void;
  setLastExecutionRun: (value: number) => void;
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
    togglePropertiesBar: (value) => {
      set({
        isPropertiesBarExpanded: value ?? !get().isPropertiesBarExpanded,
      });
    },
  };
}
