import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { Button, SnackbarType } from '@synergycodes/overflow-ui';

import { Icon } from '@/components/icons';
import { showSnackbar } from '@/utils/show-snackbar';

import { setStoreDataFromIntegration } from '@/store/slices/diagram-slice/actions';
import { SyntaxHighlighterLazy } from '@/features/syntax-highlighter/components/syntax-highlighter-lazy';

import styles from '../import-export-modal.module.css';
import {
  type IntegrationDataError,
  validateIntegrationData,
} from '@/features/integration/utils/validate-integration-data';
import { closeModal } from '@/features/modals/stores/use-modal-store';
import { trackFutureChange } from '@/features/changes-tracker/stores/use-changes-tracker-store';

export function ImportModal() {
  const [jsonToParse, setJsonToParse] = useState('{}');
  const [{ errors, warnings }, setJsonValidation] = useState<{
    errors: IntegrationDataError[];
    warnings: IntegrationDataError[];
  }>({
    errors: [],
    warnings: [],
  });

  const handleImport = useCallback(
    ({ shouldIgnoreWarnings }: { shouldIgnoreWarnings: boolean }) => {
      const { errors, warnings, validatedIntegrationData } = validateIntegrationData(jsonToParse);

      setJsonValidation({
        errors,
        warnings,
      });

      if (errors.length > 0) {
        return;
      }

      if (warnings.length > 0 && shouldIgnoreWarnings === false) {
        return;
      }

      if (validatedIntegrationData) {
        trackFutureChange('import');
        setStoreDataFromIntegration(validatedIntegrationData);
        closeModal();

        showSnackbar({
          title: 'Diagram loaded successfully',
          variant: SnackbarType.SUCCESS,
        });
      }
    },
    [jsonToParse]
  );

  return (
    <div className={styles['container']}>
      <p className={clsx('ax-public-p10', styles['tip'])}>Paste your workflow JSON data below</p>
      <SyntaxHighlighterLazy
        value={jsonToParse}
        onChange={(json) => setJsonToParse(json || '{}')}
      />
      {(errors.length > 0 || warnings.length > 0) && (
        <div className={clsx('ax-public-p10', styles['error'])}>
          {[...errors, ...warnings].map(({ message, messageParams }) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      )}
      <div className={styles['actions']}>
        {warnings.length > 0 && errors.length === 0 && (
          <Button variant="warning" onClick={() => handleImport({ shouldIgnoreWarnings: true })}>
            <Icon name="DownloadSimple" />
            Ignore Warnings & Import
          </Button>
        )}
        <Button variant="primary" onClick={() => handleImport({ shouldIgnoreWarnings: false })}>
          <Icon name="DownloadSimple" />
          Import
        </Button>
      </div>
    </div>
  );
}
