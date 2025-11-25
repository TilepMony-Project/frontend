

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
        icon: <Icon name="LayoutGrid" />,
        onClick: onDuplicateClick,
      },
    ],
    [onDuplicateClick]
  );

  return (
    <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 hidden md:flex">
      <span className="text-[var(--ax-txt-tertiary-default)] text-sm">Drafts /</span>
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
          className="text-[var(--ax-txt-primary-default)] min-h-[1em] min-w-[1em] bg-transparent border-none p-0 font-inherit cursor-pointer empty:border-b empty:border-dotted empty:border-current disabled:cursor-default ml-2 md:ml-0"
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
      <div className="relative">
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
