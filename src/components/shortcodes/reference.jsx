import { readProps, toIconName } from './shortcode-props'
import Icon from './icon-shortcode'
import { scrollToAnchor } from '../../lib/scroll'

export default function Ref({ node }) {
  const { to, label, icon } = readProps(node)
  if (typeof to !== 'string' || to.length === 0) return null

  const text = typeof label === 'string' && label.length ? label : to
  const iconName = toIconName(icon)

  const handleClick = (event) => {
    event.preventDefault()
    scrollToAnchor(to)
  }

  return (
    <a href={`#${to}`} className="sc-ref" onClick={handleClick}>
      {text}
      {iconName && <Icon name={iconName} weight={500} size="0.95em" />}
    </a>
  )
}
