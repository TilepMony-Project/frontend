import type { GetDiagramState, SetDiagramState } from "@/store/store";

export type UserPreferencesState = {
  shouldSkipShowingConfirmation: boolean;
  isExecutionMonitorActive: boolean;
  isPropertiesBarExpanded: boolean;
  setShouldSkipShowDeleteConfirmation: (value: boolean) => void;
  setExecutionMonitorActive: (value: boolean) => void;
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
    togglePropertiesBar: (value) => {
      set({
        isPropertiesBarExpanded: value ?? !get().isPropertiesBarExpanded,
      });
    },
  };
}
