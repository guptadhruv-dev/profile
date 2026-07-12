import { readProps, resolveColor, toIconName } from './shortcode-props'
import Icon from './icon-shortcode'

export default function Badge({ node }) {
  const { label, color, icon } = readProps(node)
  if (typeof label !== 'string' || label.trim().length === 0) return null

  const badgeColor = resolveColor(color)
  const iconName = toIconName(icon)

  return (
    <span className="sc-badge" style={{ '--badge-color': badgeColor }}>
      {iconName && <Icon name={iconName} fill weight={500} />}
      {label}
    </span>
  )
}
