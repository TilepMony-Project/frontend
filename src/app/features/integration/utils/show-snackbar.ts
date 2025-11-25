import { showToast, ToastType } from '@/utils/toast-utils';
import type { OnSaveParams } from '../types';

export function showSnackbarSaveSuccessIfNeeded(savingParams?: OnSaveParams) {
  if (savingParams?.isAutoSave) {
    return;
  }

  showToast({
    title: 'Workflow saved successfully',
    variant: ToastType.SUCCESS,
  });
}

export function showSnackbarSaveErrorIfNeeded(savingParams?: OnSaveParams) {
  if (savingParams?.isAutoSave) {
    return;
  }

  showToast({
    title: 'Failed to save workflow',
    variant: ToastType.ERROR,
  });
}
