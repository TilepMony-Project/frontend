import { IconSwitch } from '@/components/ui/icon-switch';
import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/use-theme';

export function ToggleDarkMode() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconSwitch
      checked={theme === 'dark'}
      onChange={toggleTheme}
      icon={<Sun size={16} />}
      IconChecked={<Moon size={16} />}
      variant="secondary"
      className="p-1.5 h-8 w-8"
    />
  );
}
