import clsx from 'clsx';

import { Sidebar } from '@/components/sidebar/sidebar';
import useStore from '@/store/store';
import { useEffect } from 'react';
import { DraggedItem } from './components/dragged-item/dragged-item';
import { PaletteHeader } from './components/header/palette-header';
import { PaletteItems } from './components/items/palette-items';
import { usePaletteDragAndDrop } from './hooks/use-palette-drag-and-drop';
import { NodePreviewContainer } from './node-preview-container';

export function PaletteContainer() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const fetchData = useStore((state) => state.fetchData);

  const isSidebarExpanded = useStore((state) => state.isSidebarExpanded);
  const paletteItems = useStore((state) => state.data);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);

  const { draggedItem, zoom, ref, onMouseDown, onDragStart } = usePaletteDragAndDrop(
    !isReadOnlyMode
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Sidebar
      className={clsx('w-auto', isSidebarExpanded && '!w-[300px]')}
      isExpanded={isSidebarExpanded}
      header={<PaletteHeader onClick={() => toggleSidebar()} />}
    >
      <PaletteItems
        items={paletteItems}
        onMouseDown={onMouseDown}
        onDragStart={onDragStart}
        isDisabled={isReadOnlyMode}
      />
      {draggedItem && (
        <DraggedItem ref={ref} zoom={zoom}>
          <NodePreviewContainer type={draggedItem.type} />
        </DraggedItem>
      )}
    </Sidebar>
  );
}
