import i18n from 'i18next';
import { openModal } from '@/features/modals/stores/use-modal-store';
import { Info } from '@phosphor-icons/react';

export function openHelpModal() {
  openModal({
    content: null,
    icon: <Info />,
    title: i18n.t('plugins.help.helpSupport'),
  });
}
