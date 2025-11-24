import { Icon, WBIcon } from '@/components/icons';
import { NavButton } from '@synergycodes/overflow-ui';
import { openNoAccessModal } from '../../functions/open-no-access-modal';

export function getAppBarButton(icon: WBIcon, tooltip?: string) {
  return function mockAppBarButton() {
    return (
      <NavButton onClick={openNoAccessModal} tooltip={tooltip}>
        <Icon name={icon} />
      </NavButton>
    );
  };
}
