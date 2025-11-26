import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

import { Icon } from '@/components/icons';
import { showToast, ToastType } from '@/utils/toast-utils';

import { setStoreDataFromIntegration } from '@/store/slices/diagram-slice/actions';
import { SyntaxHighlighterLazy } from '@/features/syntax-highlighter/components/syntax-highlighter-lazy';

import {
  type IntegrationDataError,
  validateIntegrationData,
} from '@/features/integration/utils/validate-integration-data';
import { closeModal } from '@/features/modals/stores/use-modal-store';
import { trackFutureChange } from '@/features/changes-tracker/stores/use-changes-tracker-store';

export function ImportModal() {
  const [jsonToParse, setJsonToParse] = useState('{}');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [{ errors, warnings }, setJsonValidation] = useState<{
    errors: IntegrationDataError[];
    warnings: IntegrationDataError[];
  }>({
    errors: [],
    warnings: [],
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonToParse(content || '{}');
    };
    reader.onerror = () => {
      showToast({
        title: 'Failed to read file',
        subtitle: 'Please try again or paste the JSON directly',
        variant: ToastType.ERROR,
      });
    };
    reader.readAsText(file);
  }, []);

  const handleImport = useCallback(
    ({ shouldIgnoreWarnings }: { shouldIgnoreWarnings: boolean }) => {
      const { errors, warnings, validatedIntegrationData } = validateIntegrationData(jsonToParse);

      setJsonValidation({
        errors,
        warnings,
      });

      if (errors.length > 0) {
        showToast({
          title: 'Import failed',
          subtitle: `Found ${errors.length} error${errors.length > 1 ? 's' : ''}. Please fix them before importing.`,
          variant: ToastType.ERROR,
        });
        return;
      }

      if (warnings.length > 0 && shouldIgnoreWarnings === false) {
        return;
      }

      if (validatedIntegrationData) {
        trackFutureChange('import');
        setStoreDataFromIntegration(validatedIntegrationData);
        closeModal();

        showToast({
          title: 'Diagram loaded successfully',
          variant: ToastType.SUCCESS,
        });
      }
    },
    [jsonToParse]
  );

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Import Workflow JSON
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a JSON file or paste your workflow data below
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full justify-center border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Icon name="Upload" size={18} />
          Upload JSON File
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#27282b] px-2 text-gray-500 dark:text-gray-400">
              Or paste below
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SyntaxHighlighterLazy
          value={jsonToParse}
          onChange={(json) => setJsonToParse(json || '{}')}
        />
      </div>

      {(hasErrors || hasWarnings) && (
        <div
          className={clsx(
            'flex flex-col gap-2 p-4 rounded-xl border',
            hasErrors
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
              : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50 text-yellow-900 dark:text-yellow-200'
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={hasErrors ? 'XCircle' : 'Info'}
              size={18}
              className="shrink-0"
            />
            <span className="text-sm font-semibold">
              {hasErrors
                ? `${errors.length} Error${errors.length > 1 ? 's' : ''} Found`
                : `${warnings.length} Warning${warnings.length > 1 ? 's' : ''} Found`}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pl-6">
            {errors.map(({ message }, index) => (
              <div key={`error-${index}`} className="text-sm">
                • {message}
              </div>
            ))}
            {warnings.map(({ message }, index) => (
              <div key={`warning-${index}`} className="text-sm">
                • {message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
        {hasWarnings && !hasErrors && (
          <Button
            variant="outline"
            onClick={() => handleImport({ shouldIgnoreWarnings: true })}
            className="min-w-[180px]"
          >
            <Icon name="Info" size={18} />
            Ignore Warnings & Import
          </Button>
        )}
        <Button
          variant="default"
          onClick={() => handleImport({ shouldIgnoreWarnings: false })}
          disabled={hasErrors}
          className="min-w-[120px]"
        >
          <Icon name="Download" size={18} />
          Import Workflow
        </Button>
      </div>
    </div>
  );
}
