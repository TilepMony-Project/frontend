import { Icon } from '@/components/icons';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';

type ThemeTool = {
  id: 'light' | 'dark';
  label: string;
  icon: string;
};

export function ToggleDarkMode() {
  const { theme, toggleTheme } = useTheme();

  const tools: ThemeTool[] = useMemo(
    () => [
      { id: 'light', label: 'Light Mode', icon: 'Sun' },
      { id: 'dark', label: 'Dark Mode', icon: 'Moon' },
    ],
    []
  );

  const handleClick = (toolId: 'light' | 'dark') => {
    if (theme !== toolId) {
      toggleTheme();
    }
  };

  return (
    <div className="flex rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1c1c20]">
      {tools.map((tool, index) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => handleClick(tool.id)}
          aria-pressed={theme === tool.id}
          aria-label={tool.label}
          className={clsx(
            'flex items-center gap-1 px-3 h-8 text-sm transition-colors',
            index === 0 && 'rounded-l-full',
            index === tools.length - 1 && 'rounded-r-full',
            theme === tool.id
              ? 'bg-[#1296e7] text-white shadow-sm'
              : 'text-gray-600 hover:bg-[#eeeff3] dark:text-gray-300 dark:hover:bg-[#2c2d31]'
          )}
        >
          <Icon name={tool.icon} size={16} />
        </button>
      ))}
    </div>
  );
}
