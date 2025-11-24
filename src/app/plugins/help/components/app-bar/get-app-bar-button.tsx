import { Icon, WBIcon } from '@/components/icons';
import { NavButton } from '@synergycodes/overflow-ui';

export function getAppBarButton(icon: WBIcon, tooltip?: string) {
  return function mockAppBarButton() {
    return (
      <NavButton onClick={() => {
        // TODO: Implement button functionality
      }} tooltip={tooltip}>
        <Icon name={icon} />
      </NavButton>
    );
  };
}
