import i18n from 'i18next';
import { Icon } from '@/components/icons';
import { NoAccess } from '../modals/no-access/no-access';
import { openModal } from '@/features/modals/stores/use-modal-store';

export function openNoAccessModal() {
  openModal({
    content: <NoAccess />,
    icon: <Icon name="LockSimpleOpen" />,
    title: i18n.t('plugins.help.header'),
  });
}
