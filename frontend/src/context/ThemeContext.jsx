import { createContext, useContext, useState, useLayoutEffect } from 'react';
import { Chart } from 'chart.js';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'theme';

const getInitialTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Fall back to the OS/browser preference on first visit
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Keep Chart.js legend/axis text legible against the current background —
// otherwise chart labels stay a fixed dark gray and become unreadable on a dark page.
const syncChartDefaults = (theme) => {
  Chart.defaults.color = theme === 'dark' ? '#9cbaa9' : '#52695c';
  Chart.defaults.borderColor = theme === 'dark' ? '#1c332a' : '#e2f0e6';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    syncChartDefaults(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
