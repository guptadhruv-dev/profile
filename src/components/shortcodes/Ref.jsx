import { readProps, toIconName } from './props'
import Icon from './Icon'
import { scrollToAnchor } from '../../scrollToAnchor'

export default function Ref({ node }) {
  const { to, label, icon } = readProps(node)
  if (typeof to !== 'string' || to.length === 0) return null

  const text = typeof label === 'string' && label.length ? label : to
  const iconName = toIconName(icon)

  const onClick = (e) => {
    e.preventDefault()
    scrollToAnchor(to)
  }

  return (
    <a href={`#${to}`} className="sc-ref" onClick={onClick}>
      {text}
      {iconName && <Icon name={iconName} weight={500} style={{ fontSize: '0.95em' }} />}
    </a>
  )
}
