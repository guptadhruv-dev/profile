import { cssSize, readProps, resolveColor, toIconName } from './shortcode-props'
import { joinClassNames } from '../../lib/class-names'

const defaultIconSizeCss = '1.2em'
const defaultIconWeight = 400

function normalizeIconWeight(value) {
  const numericWeight = Number(value)
  return Number.isFinite(numericWeight) && numericWeight >= 100 && numericWeight <= 700
    ? numericWeight
    : defaultIconWeight
}

export default function Icon({ node, name, size, weight, fill, color, className, style }) {
  const iconProperties = node ? readProps(node) : { name, size, weight, fill, color }
  const iconName = toIconName(iconProperties.name)
  if (!iconName) return null

  const fillValue = iconProperties.fill === true || iconProperties.fill === 1 ? 1 : 0
  const iconColor = resolveColor(iconProperties.color, null)

  return (
    <span
      className={joinClassNames('material-symbols-rounded', className)}
      aria-hidden="true"
      style={{
        fontSize: cssSize(iconProperties.size, defaultIconSizeCss),
        width: defaultIconSizeCss,
        lineHeight: '1em',
        verticalAlign: 'middle',
        fontVariationSettings: `'FILL' ${fillValue}, 'wght' ${normalizeIconWeight(iconProperties.weight)}`,
        ...(iconColor ? { color: iconColor } : {}),
        ...style,
      }}
    >
      {iconName}
    </span>
  )
}
