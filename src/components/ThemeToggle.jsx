import { useTheme } from './ThemeProvider'
import Icon from './shortcodes/Icon'

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  const isDark = mode === 'dark'
  const icon = isDark ? 'light_mode' : 'dark_mode'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="hover-fg"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        padding: 0,
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        color: 'var(--color-fg-secondary)',
        transition: `color var(--motion-duration) var(--motion-ease)`,
      }}
    >
      <Icon name={icon} weight={400} style={{ fontSize: '1.375rem' }} />
    </button>
  )
}
