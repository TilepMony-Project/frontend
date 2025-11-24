import styles from './palette-footer.module.css';
import { Button } from '@synergycodes/overflow-ui';
import { OptionalFooterContent } from '@/features/plugins-core/components/optional-footer-content';

type Props = {
  onTemplateClick: () => void;
};

export function PaletteFooter({ onTemplateClick }: Props) {
  return (
    <div className={styles['container']}>
      <OptionalFooterContent>
        <Button variant="secondary" onClick={onTemplateClick} size="small">
          Templates
        </Button>
      </OptionalFooterContent>
    </div>
  );
}
