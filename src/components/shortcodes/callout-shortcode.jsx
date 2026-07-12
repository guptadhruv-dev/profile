import { readProps, toIconName } from './shortcode-props'
import Icon from './icon-shortcode'

const calloutTypes = Object.freeze({
  info: { icon: 'info' },
  tip: { icon: 'lightbulb' },
  warning: { icon: 'warning' },
  danger: { icon: 'error' },
  note: { icon: 'note' },
})
const defaultCalloutType = 'note'

export default function Callout({ node, children }) {
  const { type, icon } = readProps(node)
  const calloutType = calloutTypes[type] ? type : defaultCalloutType
  const calloutColor = `var(--accent-${calloutType})`
  const iconName = toIconName(icon) ?? calloutTypes[calloutType].icon

  return (
    <div className="sc-callout" style={{ '--callout-accent': calloutColor }}>
      <Icon name={iconName} fill weight={500} className="sc-callout-icon" />
      <div className="sc-callout-body">{children}</div>
    </div>
  )
}
