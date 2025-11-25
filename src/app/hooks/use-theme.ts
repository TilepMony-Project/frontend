import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'wb-theme';
type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'light';
    }
    return (localStorage.getItem(THEME_KEY) || 'light') as Theme;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.document) {
      return;
    }

    // Update class for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Keep data-theme for backward compatibility
    document.documentElement.dataset.theme = theme;

    if (window.localStorage) {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((previous) => (previous === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
