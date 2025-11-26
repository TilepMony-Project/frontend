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
      title: 'Copied to clipboard',
      subtitle: 'JSON data has been copied to your clipboard',
      variant: ToastType.SUCCESS,
    });
  }, [storeData]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([storeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Download started',
      subtitle: 'Your workflow JSON file is being downloaded',
      variant: ToastType.SUCCESS,
    });
  }, [storeData]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Export Workflow JSON
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Copy the JSON data or download it as a file to save your workflow configuration
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <SyntaxHighlighterLazy value={storeData} onChange={noop} isDisabled />
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-2">
          <Icon name="Info" size={14} />
          <span>This JSON contains your complete workflow configuration</span>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={handleCopy} className="min-w-[120px]">
          <Icon name="Copy" size={18} />
          Copy JSON
        </Button>
        <Button variant="default" onClick={handleDownload} className="min-w-[140px]">
          <Icon name="Download" size={18} />
          Download File
        </Button>
      </div>
    </div>
  );
}
