import { Icon } from '@/components/icons';
import { NoAccess } from '../modals/no-access/no-access';
import { openModal } from '@/features/modals/stores/use-modal-store';

export function openNoAccessModal() {
  openModal({
    content: <NoAccess />,
    icon: <Icon name="LockSimpleOpen" />,
    title: 'Unlock Full Product Access',
  });
}
