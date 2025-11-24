import styles from '../../app-bar.module.css';

import { NavButton, Menu, Input } from '@synergycodes/overflow-ui';
import { useMemo, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { Icon } from '@/components/icons';
import useStore from '@/store/store';
import { withOptionalComponentPlugins } from '@/features/plugins-core/adapters/adapter-components';

type ProjectSelectionProps = {
  onDuplicateClick?: () => void;
};

function ProjectSelectionComponent({ onDuplicateClick }: ProjectSelectionProps) {
  const documentName = useStore((state) => state.documentName || '');
  const isReadOnlyMode = useStore((store) => store.isReadOnlyMode);
  const setDocumentName = useStore((state) => state.setDocumentName);
  const [editName, setEditName] = useState<boolean>(false);

  const items = useMemo(
    () => [
      {
        label: 'Duplicate to Drafts',
        icon: <Icon name="Cards" />,
        onClick: onDuplicateClick,
      },
    ],
    [onDuplicateClick],
  );

  return (
    <div className={styles['project-selection']}>
      <span className={styles['folder-name']}>Drafts /</span>
      {editName && !isReadOnlyMode ? (
        <Input
          value={documentName}
          onChange={(event) => {
            if (event.target.value.length > 128) return;
            setDocumentName(event.target.value);
          }}
          onBlur={() => setEditName(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          autoFocus={true}
        />
      ) : (
        <span className={styles['title']} onClick={() => !isReadOnlyMode && setEditName(true)}>
          {documentName}
        </span>
      )}
      <div className={styles['menu-container']}>
        <Menu items={items}>
          <NavButton tooltip="Pick the Project">
            <CaretDown />
          </NavButton>
        </Menu>
      </div>
    </div>
  );
}

export const ProjectSelection = withOptionalComponentPlugins(ProjectSelectionComponent, 'ProjectSelection');
