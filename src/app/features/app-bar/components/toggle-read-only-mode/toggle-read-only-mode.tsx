import { IconSwitch } from '@/components/ui/icon-switch';
import { Pencil, PencilOff } from 'lucide-react';

import useStore from '@/store/store';

export function ToggleReadyOnlyMode() {
  const isReadOnlyMode = useStore((store) => store.isReadOnlyMode);
  const setToggleReadOnlyMode = useStore((store) => store.setToggleReadOnlyMode);

  return (
    <IconSwitch
      checked={isReadOnlyMode}
      onChange={setToggleReadOnlyMode}
      icon={<Pencil size={16} />}
      IconChecked={<PencilOff size={16} />}
      className="p-1.5 h-8 w-8"
    />
  );
}
