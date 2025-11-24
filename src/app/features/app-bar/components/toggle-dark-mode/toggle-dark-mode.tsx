import { IconSwitch } from '@synergycodes/overflow-ui';
import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/use-theme';

export function ToggleDarkMode() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconSwitch
      checked={theme === 'dark'}
      onChange={toggleTheme}
      icon={<Sun />}
      IconChecked={<Moon />}
      variant="secondary"
    />
  );
}
