import { useCallback } from 'react';

export function useTranslateIfPossible() {
  const translateIfPossible = useCallback(
    (value = '') => {
      // i18n removed - return value as-is
      return value || undefined;
    },
    [],
  );

  return translateIfPossible;
}
