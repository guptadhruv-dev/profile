import Icon from './shortcodes/Icon'
import { M } from '../motion'

export default function SectionButton({
  label,
  icon,
  iconOnly = false,
  isActive,
  onClick,
  align = 'start',
}) {
  const justifyContent =
    iconOnly || align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start'

  return (
    <button
      onClick={onClick}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={isActive ? '' : 'hover-fg'}
      style={{
        fontFamily: 'var(--font-family)',
        fontSize: '1.05rem',
        fontWeight: isActive ? '500' : '400',
        color: isActive ? 'var(--color-fg-primary)' : 'var(--color-fg-secondary)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',

        display: 'flex',
        alignItems: 'center',
        justifyContent,
        gap: iconOnly ? 0 : '0.3rem',

        width: '100%',
        textTransform: 'capitalize',

        transition: `color ${M}, opacity ${M}, font-weight ${M}`,
      }}
    >
      <span 
      style={{ display: 'flex', paddingBottom: iconOnly ? 0 : '0.075rem'}}>
        <Icon name={icon} size = "1.4rem" />
      </span>

      {!iconOnly && (
        <span>
          {label}
        </span>
      )}
    </button>
  )
}
