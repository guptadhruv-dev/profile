import { useTheme } from './theme-provider'
import Icon from './shortcodes/icon-shortcode'

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  const isDark = mode === 'dark'
  const iconName = isDark ? 'light_mode' : 'dark_mode'
  const toggleLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={toggleLabel}
      title={toggleLabel}
      className="theme-toggle hover-fg"
    >
      <Icon name={iconName} weight={400} />
    </button>
  )
}
