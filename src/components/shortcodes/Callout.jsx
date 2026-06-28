import { readProps, toIconName } from './props'
import Icon from './Icon'

const TYPES = {
  info: { icon: 'info' },
  tip: { icon: 'lightbulb' },
  warning: { icon: 'warning' },
  danger: { icon: 'error' },
  note: { icon: 'note' },
}

export default function Callout({ node, children }) {
  const { type, icon } = readProps(node)
  const variant = TYPES[type] ? type : 'note'
  const accent = `var(--accent-${variant})`
  const iconName = toIconName(icon) ?? TYPES[variant].icon

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.7em',
        margin: '1em 0',
        padding: '0.85em 1em',
        borderRadius: '10px',
        background: `color-mix(in srgb, ${accent} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      }}
    >
      <Icon
        name={iconName}
        fill={1}
        weight={500}
        style={{ color: accent, fontSize: '1.4em', alignSelf: 'top', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
