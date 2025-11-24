import { Icon } from '@/components/icons';
import { showSnackbar } from '@/utils/show-snackbar';
import { NavButton, SnackbarType } from '@synergycodes/overflow-ui';

export function RunButton() {
  function handleRun() {
    showSnackbar({
      title: 'Workflow execution coming soon',
      subtitle: 'Backend + smart contract integration is in progress.',
      variant: SnackbarType.INFO,
    });
  }

  return (
    <NavButton onClick={handleRun} tooltip="Run workflow">
      <Icon name="Play" />
    </NavButton>
  );
}
