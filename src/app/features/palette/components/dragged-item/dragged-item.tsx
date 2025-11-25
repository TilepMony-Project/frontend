import { type PropsWithChildren, forwardRef } from 'react';
import { createPortal } from 'react-dom';

import { isChrome, isFirefox, isOpera, isSafari } from '@/utils/browser';

type DraggedItemProps = {
  zoom: number;
};

export const DraggedItem = forwardRef<HTMLDivElement, PropsWithChildren<DraggedItemProps>>(
  ({ children, zoom }: PropsWithChildren<DraggedItemProps>, ref) => {
    function getStyles() {
      if (isSafari && !isOpera && !isChrome) {
        return zoom > 1 ? { zoom: `${zoom}` } : { scale: `${zoom}` };
      }

      if (isFirefox) {
        return { scale: `${zoom}` };
      }

      return { zoom: `${zoom}` };
    }

    return createPortal(
      <div ref={ref} className="absolute bg-transparent origin-top-left z-[2] top-full" style={getStyles()}>
        {children}
      </div>,
      document.body
    );
  }
);
