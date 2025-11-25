import clsx from 'clsx';
import { Icon } from '@/components/icons';

import { useIntegrationStore } from '../../stores/use-integration-store';

export function SavingStatus() {
  // lastSaveAttemptTimestamp is used here as a key to reset the animation on each save
  const lastSaveAttemptTimestamp = useIntegrationStore((state) => state.lastSaveAttemptTimestamp);
  const savingStatus = useIntegrationStore((state) => state.savingStatus);

  if (savingStatus === 'saving') {
    return (
      <span className="flex items-center justify-center p-1.5 rounded-lg text-[var(--wb-saving-status-color)] bg-[var(--wb-saving-status-background-color)]">
        <Icon name="Spinner" />
      </span>
    );
  }

  if (savingStatus === 'saved') {
    return (
      <span
        key={lastSaveAttemptTimestamp}
        className="flex items-center justify-center p-1.5 rounded-lg text-[var(--wb-saving-status-success-color)] bg-[var(--wb-saving-status-success-background-color)] animate-[fadeOut_2s_ease-in-out_forwards]"
      >
        <Icon name="CheckCircle" />
      </span>
    );
  }

  if (savingStatus === 'notSaved') {
    return (
      <span
        key={lastSaveAttemptTimestamp}
        className="flex items-center justify-center p-1.5 rounded-lg text-[var(--wb-saving-status-error-color)] bg-[var(--wb-saving-status-error-background-color)]"
      >
        <Icon name="XCircle" />
      </span>
    );
  }

  return null;
}
