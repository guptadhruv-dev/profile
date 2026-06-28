import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fontFamily, colors, motion } from '../design.config'
import { getInitialTheme, THEME_STORAGE_KEY } from '../shared'

const ThemeContext = createContext({ mode: 'dark', toggleMode: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', fontFamily)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const theme = colors[mode]

    root.classList.remove('dark', 'light')
    root.classList.add(mode)

    root.style.setProperty('--color-bg-primary', theme.background.primary)
    root.style.setProperty('--color-bg-secondary', theme.background.secondary)
    root.style.setProperty('--color-fg-primary', theme.foreground.primary)
    root.style.setProperty('--color-fg-secondary', theme.foreground.secondary)

    for (const [key, value] of Object.entries(theme.accent)) {
      root.style.setProperty(`--accent-${key}`, value)
    }
    for (const [key, value] of Object.entries(theme.syntax)) {
      root.style.setProperty(`--syntax-${key}`, value)
    }

    root.style.setProperty('--motion-duration', motion.duration)
    root.style.setProperty('--motion-ease', motion.ease)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {}
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
