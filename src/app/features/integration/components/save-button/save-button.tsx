import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icons';
import { useContext } from 'react';
import { IntegrationContext } from '../integration-variants/context/integration-context-wrapper';
import { SavingStatus } from '../saving-status/saving-status';
import { useAutoSave } from '../../hooks/use-auto-save';
import { useAutoSaveOnClose } from '../../hooks/use-auto-save-on-close';

export function SaveButton() {
  const { onSave } = useContext(IntegrationContext);

  function handleSave() {
    onSave({ isAutoSave: false });
  }

  useAutoSave();
  useAutoSaveOnClose();

  return (
    <Button onClick={handleSave} variant="ghost" size="icon">
      <>
        <SavingStatus />
        <Icon name="Save" />
      </>
    </Button>
  );
}
