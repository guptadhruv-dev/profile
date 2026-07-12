import Icon from './shortcodes/icon-shortcode'
import { joinClassNames } from '../lib/class-names'

export default function SectionButton({
  label,
  icon,
  iconOnly = false,
  isActive,
  onClick,
  align = 'start',
}) {
  const className = joinClassNames(
    'section-button',
    isActive && 'is-active',
    iconOnly && 'is-icon-only',
    (iconOnly || align === 'center') && 'is-centered',
    align === 'end' && 'is-end',
    !isActive && 'hover-fg',
  )

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={className}
    >
      <span className="section-button-icon">
        <Icon name={icon} fill={isActive} />
      </span>
      {!iconOnly && <span>{label}</span>}
    </button>
  )
}
