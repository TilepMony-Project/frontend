import { Icon } from "@/components/icons";

import { useIntegrationStore } from "../../stores/use-integration-store";

export function SavingStatus() {
  // lastSaveAttemptTimestamp is used here as a key to reset the animation on each save
  const lastSaveAttemptTimestamp = useIntegrationStore((state) => state.lastSaveAttemptTimestamp);
  const savingStatus = useIntegrationStore((state) => state.savingStatus);

  if (savingStatus === "saving") {
    return (
      <span className="flex items-center justify-center p-1.5 rounded-lg text-[var(--wb-saving-status-color)] bg-[var(--wb-saving-status-background-color)]">
        <Icon name="Loader2" />
      </span>
    );
  }

  if (savingStatus === "saved") {
    return (
      <span
        key={lastSaveAttemptTimestamp}
        className="flex items-center justify-center p-0.5 rounded-full text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 animate-[fadeOut_2s_ease-in-out_forwards]"
      >
        <Icon name="Check" size={6} />
      </span>
    );
  }

  if (savingStatus === "notSaved") {
    return (
      <span
        key={lastSaveAttemptTimestamp}
        className="flex items-center justify-center p-0.5 rounded-full text-[var(--wb-saving-status-error-color)] bg-[var(--wb-saving-status-error-background-color)]"
      >
        <Icon name="XCircle" size={6} />
      </span>
    );
  }

  return null;
}
