import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const THEME_KEY = "wb-theme";
type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return "dark";
    }
    return (localStorage.getItem(THEME_KEY) || "dark") as Theme;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.document) {
      return;
    }

    // Update class for Tailwind dark mode
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Keep data-theme for backward compatibility
    document.documentElement.dataset.theme = theme;

    if (window.localStorage) {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((previous) => (previous === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
