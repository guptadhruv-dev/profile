import { readProps, toIconName } from './props'

function toNumber(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return fallback
}

export default function Icon({ node, name, size, weight, fill, className, style }) {
  const props = node ? readProps(node) : { name, size, weight, fill }
  const iconName = toIconName(props.name)
  if (!iconName) return null

  const fontSize =
    props.size == null
      ? '1.5em'
      : typeof props.size === 'number'
        ? `${props.size}px`
        : String(props.size)
  const weightVal = toNumber(props.weight, 200)
  const fillVal = props.fill === true || props.fill === 1 ? 1 : 0

  return (
    <span
      className={`material-symbols-outlined ${className ?? ''}`.trim()}
      aria-hidden="true"
      style={{
        fontSize,
        verticalAlign: 'middle',
        fontVariationSettings: `'FILL' ${fillVal}, 'wght' ${weightVal}`,
        ...style,
      }}
    >
      {iconName}
    </span>
  )
}
