import { Icon } from '@/components/icons';
import { openModal } from '@/features/modals/stores/use-modal-store';
import { ImportModal } from './import-modal';

export function openImportModal() {
  openModal({
    content: <ImportModal />,
    icon: <Icon name="DownloadSimple" />,
    title: 'Import',
  });
}
