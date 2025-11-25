import { IconSwitch } from '@/components/ui/icon-switch';
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
