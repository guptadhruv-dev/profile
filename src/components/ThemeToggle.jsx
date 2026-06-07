import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';
  const icon   = isDark ? 'light_mode' : 'dark_mode';
  const label  = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          32,
        height:         32,
        padding:        0,
        background:     'transparent',
        border:         'none',
        borderRadius:   6,
        cursor:         'pointer',
        color:          'var(--color-fg-secondary)',
        transition:     'color var(--motion-duration) var(--motion-ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-fg-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-secondary)'; }}
    >
      <span
        className="material-symbols-outlined"
        aria-hidden="true"
        style={{
          fontSize:              '22px',
          fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        {icon}
      </span>
    </button>
  );
}
