
import { NavButton } from '@synergycodes/overflow-ui';
import { Icon } from '@/components/icons';

type PaletteHeaderProps = {
  onClick: () => void;
  isSidebarExpanded: boolean;
};

export function PaletteHeader({ onClick, isSidebarExpanded }: PaletteHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="ax-public-h7">Nodes Library</span>
      <NavButton
        size="small"
        onClick={onClick}
        tooltip={isSidebarExpanded ? 'Close Palette' : 'Open Palette'}
      >
        <Icon name="SidebarSimple" />
      </NavButton>
    </div>
  );
}
