import { readProps, toIconName } from './props'
import Icon from './Icon'
import { externalLinkProps } from '../../shared'

export default function Card({ node, children }) {
  const { title, icon, href } = readProps(node)
  const iconName = toIconName(icon)

  const isLink = typeof href === 'string' && href.length > 0
  const Tag = isLink ? 'a' : 'div'
  const linkProps = isLink ? { href, ...externalLinkProps(href) } : {}

  return (
    <Tag className="sc-card" style={isLink ? { textDecoration: 'none' } : undefined} {...linkProps}>
      {(title || iconName) && (
        <div className="sc-card-title">
          {iconName && <Icon name={iconName} />}
          {title}
        </div>
      )}
      {children}
    </Tag>
  )
}
