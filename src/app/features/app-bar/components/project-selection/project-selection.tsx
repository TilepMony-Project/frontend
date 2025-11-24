import styles from '../../app-bar.module.css';

import { Icon } from '@/components/icons';
import { IntegrationContext } from '@/features/integration/components/integration-variants/context/integration-context-wrapper';
import { withOptionalComponentPlugins } from '@/features/plugins-core/adapters/adapter-components';
import useStore from '@/store/store';
import { Input, Menu, NavButton } from '@synergycodes/overflow-ui';
import { ChevronDown } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';

type ProjectSelectionProps = {
  onDuplicateClick?: () => void;
};

function ProjectSelectionComponent({ onDuplicateClick }: ProjectSelectionProps) {
  const documentName = useStore((state) => state.documentName || '');
  const isReadOnlyMode = useStore((store) => store.isReadOnlyMode);
  const setDocumentName = useStore((state) => state.setDocumentName);
  const [editName, setEditName] = useState<boolean>(false);
  const { onSave } = useContext(IntegrationContext);

  function handleCommitName() {
    setEditName(false);
    if (onSave) {
      void onSave({ isAutoSave: false });
    }
  }

  function handleStartEditing() {
    if (isReadOnlyMode) {
      return;
    }
    setEditName(true);
  }

  const items = useMemo(
    () => [
      {
        label: 'Duplicate to Drafts',
        icon: <Icon name="Cards" />,
        onClick: onDuplicateClick,
      },
    ],
    [onDuplicateClick]
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
          onBlur={handleCommitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          autoFocus={true}
        />
      ) : (
        <button
          className={styles.title}
          type="button"
          disabled={isReadOnlyMode}
          onClick={handleStartEditing}
          onKeyDown={(event) => {
            if (isReadOnlyMode) {
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setEditName(true);
            }
          }}
        >
          {documentName}
        </button>
      )}
      <div className={styles['menu-container']}>
        <Menu items={items}>
          <NavButton tooltip="Pick the Project">
            <ChevronDown />
          </NavButton>
        </Menu>
      </div>
    </div>
  );
}

export const ProjectSelection = withOptionalComponentPlugins(
  ProjectSelectionComponent,
  'ProjectSelection'
);
