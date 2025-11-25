

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icons';

type Props = {
  header: string;
  name: string;
  isExpanded: boolean;
  onDotsClick?: () => void;
};

export function PropertiesBarHeader({ isExpanded, header, name, onDotsClick }: Props) {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col flex-grow [&>p]:line-clamp-2 [&>p]:m-0">
        <span className={name ? 'ax-public-h9' : 'ax-public-h7'}>{header}</span>
        {isExpanded && <p className="ax-public-p11">{name}</p>}
      </div>
      {onDotsClick && (
        <Button size="sm" variant="ghost" onClick={onDotsClick}>
          <Icon name="DotsThreeVertical" />
        </Button>
      )}
    </div>
  );
}
