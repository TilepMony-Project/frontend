import { showSnackbar } from '@/utils/show-snackbar';
import { SnackbarType } from '@synergycodes/overflow-ui';
import type { OnSaveParams } from '../types';

export function showSnackbarSaveSuccessIfNeeded(savingParams?: OnSaveParams) {
  if (savingParams?.isAutoSave) {
    return;
  }

  showSnackbar({
    title: 'Workflow saved successfully',
    variant: SnackbarType.SUCCESS,
  });
}

export function showSnackbarSaveErrorIfNeeded(savingParams?: OnSaveParams) {
  if (savingParams?.isAutoSave) {
    return;
  }

  showSnackbar({
    title: 'Failed to save workflow',
    variant: SnackbarType.ERROR,
  });
}
