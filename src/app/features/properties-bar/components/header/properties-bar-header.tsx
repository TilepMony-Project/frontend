import clsx from 'clsx';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';

type Props = {
  header: string;
  name: string;
  isExpanded: boolean;
  onDotsClick?: () => void;
  onToggleExpand?: () => void;
  isSidebarExpanded?: boolean;
};

export function PropertiesBarHeader({
  header,
  onDotsClick,
  onToggleExpand,
  isSidebarExpanded = true,
}: Props) {
  return (
    <div className="flex justify-between items-center gap-3">
      <div className="flex flex-col flex-grow gap-1 min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">
          {header}
        </h2>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onToggleExpand && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleExpand()}
            aria-label="Toggle properties"
            className="h-8 w-8 p-0"
          >
            <Icon
              name="PanelLeft"
              className={clsx(
                'h-4 w-4 transition-transform duration-200 ease-in-out',
                !isSidebarExpanded && 'rotate-180'
              )}
            />
          </Button>
        )}
        {onDotsClick && (
          <Button size="sm" variant="ghost" onClick={onDotsClick} className="h-8 w-8 p-0">
            <Icon name="DotsThreeVertical" className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
