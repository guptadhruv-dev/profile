import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

function persistThemeMode(mode) {
  const themeStorageKey = document.documentElement.dataset.themeStorageKey
  if (!themeStorageKey) return false
  try {
    window.localStorage.setItem(themeStorageKey, mode)
    return true
  } catch {
    return false
  }
}

export function useTheme() {
  const themeContext = useContext(ThemeContext)
  if (!themeContext) throw new Error('useTheme must be used inside ThemeProvider')
  return themeContext
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark',
  )

  useEffect(() => {
    const documentRoot = document.documentElement
    documentRoot.classList.remove('dark', 'light')
    documentRoot.classList.add(mode)
    persistThemeMode(mode)
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))
  }, [])

  const contextValue = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode])

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
