import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fontFamily, colors, motion } from '../design.config';

const STORAGE_KEY = 'theme-mode';

const ThemeContext = createContext({ mode: 'dark', toggleMode: () => {} });

function getInitialMode() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  if (typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const root  = document.documentElement;
    const theme = colors[mode];

    root.classList.remove('dark', 'light');
    root.classList.add(mode);

    root.style.setProperty('--font-family', fontFamily);

    root.style.setProperty('--color-bg-primary',   theme.background.primary);
    root.style.setProperty('--color-bg-secondary', theme.background.secondary);
    root.style.setProperty('--color-fg-primary',   theme.foreground.primary);
    root.style.setProperty('--color-fg-secondary', theme.foreground.secondary);

    for (const [key, value] of Object.entries(theme.accent)) {
      root.style.setProperty(`--accent-${key}`, value);
    }
    for (const [key, value] of Object.entries(theme.syntax)) {
      root.style.setProperty(`--syntax-${key}`, value);
    }

    root.style.setProperty('--motion-duration', motion.duration);
    root.style.setProperty('--motion-ease',     motion.ease);

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
