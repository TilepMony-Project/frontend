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
  isExpanded,
  header,
  name,
  onDotsClick,
  onToggleExpand,
  isSidebarExpanded = true,
}: Props) {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col flex-grow [&>p]:line-clamp-2 [&>p]:m-0">
        <span className={name ? 'ax-public-h9' : 'ax-public-h7'}>{header}</span>
        {isExpanded && <p className="ax-public-p11">{name}</p>}
      </div>
      <div className="flex items-center gap-1">
        {onToggleExpand && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleExpand()}
            aria-label="Toggle properties"
          >
            <Icon
              name="PanelLeft"
              className={clsx('transition-transform', !isSidebarExpanded && 'rotate-180')}
            />
          </Button>
        )}
        {onDotsClick && (
          <Button size="sm" variant="ghost" onClick={onDotsClick}>
            <Icon name="DotsThreeVertical" />
          </Button>
        )}
      </div>
    </div>
  );
}
