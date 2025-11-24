import { Button } from '@synergycodes/overflow-ui';
import { openHelpModal } from '../functions/open-help-modal';

export function FooterSupportButton() {
  return (
    <Button variant="secondary" onClick={openHelpModal} size="small">
      Help & Support
    </Button>
  );
}
