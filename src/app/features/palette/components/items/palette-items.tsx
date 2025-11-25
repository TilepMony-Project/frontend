import clsx from 'clsx';

import { NodePreviewContainer } from '../../node-preview-container';
import type { PaletteItem } from '@/types/common';
import type { DragEvent } from 'react';

type PaletteItemsProps = {
  onDragStart: (event: DragEvent) => void;
  onMouseDown: (type: string) => void;
  items: PaletteItem[];
  isDisabled?: boolean;
};

export function PaletteItems({
  items,
  onDragStart,
  onMouseDown,
  isDisabled = false,
}: PaletteItemsProps) {
  return (
    <div className="flex flex-col gap-2 box-border">
      {items.map((item) => (
        <div
          key={item.type}
          draggable={!isDisabled}
          className={clsx(
            'rounded-xl cursor-grab outline-offset-[-1px] outline outline-1 outline-transparent',
            isDisabled && 'cursor-default select-none opacity-50'
          )}
          onMouseDown={() => onMouseDown(item.type)}
          onDragStart={onDragStart}
        >
          <NodePreviewContainer type={item.type} />
        </div>
      ))}
    </div>
  );
}
