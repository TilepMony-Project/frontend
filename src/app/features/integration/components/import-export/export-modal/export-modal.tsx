import { useCallback, useMemo } from 'react';
import { Button, SnackbarType } from '@synergycodes/overflow-ui';

import { showSnackbar } from '@/utils/show-snackbar';
import { Icon } from '@/components/icons';

import { getStoreDataForIntegration } from '@/store/slices/diagram-slice/actions';
import { SyntaxHighlighterLazy } from '@/features/syntax-highlighter/components/syntax-highlighter-lazy';
import { copy } from '@/utils/copy';
import { noop } from '@/utils/noop';



export function ExportModal() {
  const storeData = useMemo(() => {
    return JSON.stringify(getStoreDataForIntegration(), null, 2);
  }, []);

  const handleCopy = useCallback(() => {
    copy(storeData);

    showSnackbar({
      title: 'Content copied to clipboard',
      variant: SnackbarType.SUCCESS,
    });
  }, [storeData]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <SyntaxHighlighterLazy value={storeData} onChange={noop} isDisabled />
      <div className="flex gap-2 justify-end">
        <Button variant="primary" onClick={handleCopy}>
          <Icon name="Copy" />
          Copy
        </Button>
      </div>
    </div>
  );
}
