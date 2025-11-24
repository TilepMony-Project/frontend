import { IconSwitch } from '@synergycodes/overflow-ui';
import { Pencil, PencilOff } from 'lucide-react';

import useStore from '@/store/store';

export function ToggleReadyOnlyMode() {
  const isReadOnlyMode = useStore((store) => store.isReadOnlyMode);
  const setToggleReadOnlyMode = useStore((store) => store.setToggleReadOnlyMode);

  return (
    <IconSwitch
      checked={isReadOnlyMode}
      onChange={setToggleReadOnlyMode}
      icon={<Pencil />}
      IconChecked={<PencilOff />}
    />
  );
}
