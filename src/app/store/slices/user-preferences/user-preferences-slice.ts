import type { GetDiagramState, SetDiagramState } from '@/store/store';

export type UserPreferencesState = {
  shouldSkipShowingConfirmation: boolean;
  isExecutionMonitorActive: boolean;
  setShouldSkipShowDeleteConfirmation: (value: boolean) => void;
  setExecutionMonitorActive: (value: boolean) => void;
};

export function useUserPreferencesSlice(
  set: SetDiagramState,
  _get: GetDiagramState
): UserPreferencesState {
  return {
    shouldSkipShowingConfirmation: false,
    isExecutionMonitorActive: false,
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
  };
}
