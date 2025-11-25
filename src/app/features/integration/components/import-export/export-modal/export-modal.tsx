import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';

import { showToast, ToastType } from '@/utils/toast-utils';
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

    showToast({
      title: 'Content copied to clipboard',
      variant: ToastType.SUCCESS,
    });
  }, [storeData]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <SyntaxHighlighterLazy value={storeData} onChange={noop} isDisabled />
      <div className="flex gap-2 justify-end">
        <Button variant="default" onClick={handleCopy}>
          <Icon name="Copy" />
          Copy
        </Button>
      </div>
    </div>
  );
}
