
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icons';

type PaletteHeaderProps = {
  onClick: () => void;
  isSidebarExpanded: boolean;
};

export function PaletteHeader({ onClick, isSidebarExpanded }: PaletteHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="ax-public-h7">Nodes Library</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClick}
      >
        <Icon name="PanelLeft" />
      </Button>
    </div>
  );
}
