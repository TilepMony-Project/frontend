import clsx from 'clsx';

import type { PaletteItem } from '@/types/common';
import type { DragEvent } from 'react';
import { NodePreviewContainer } from '../../node-preview-container';

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
    <div className="flex flex-col gap-3 box-border">
      {items.map((item) => (
        <div
          key={item.type}
          draggable={!isDisabled}
          className={clsx(
            'rounded-xl cursor-grab outline-offset-[-1px] outline outline-1 outline-transparent',
            'transition-all duration-200 ease-in-out',
            'hover:outline-gray-300 dark:hover:outline-gray-600',
            'hover:shadow-md active:scale-[0.98]',
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
