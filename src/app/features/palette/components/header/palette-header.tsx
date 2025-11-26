import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';

type PaletteHeaderProps = {
  onClick: () => void;
};

export function PaletteHeader({ onClick }: PaletteHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        Nodes Library
      </h2>
      <Button size="sm" variant="ghost" onClick={onClick} className="h-8 w-8 p-0">
        <Icon name="PanelLeft" className="h-4 w-4 transition-transform duration-200" />
      </Button>
    </div>
  );
}
