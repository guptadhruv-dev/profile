import { readProps, toIconName } from './shortcode-props'
import Icon from './icon-shortcode'
import { externalLinkProps, proxyProtectedUrl } from '../../lib/proxy'

export default function Card({ node, children }) {
  const { title, icon, href } = readProps(node)
  const iconName = toIconName(icon)
  const cardUrl = proxyProtectedUrl(href, 'link')
  const CardElement = cardUrl ? 'a' : 'div'
  const linkProperties = cardUrl ? { href: cardUrl, ...externalLinkProps(cardUrl) } : {}

  return (
    <CardElement className="sc-card" {...linkProperties}>
      {(title || iconName) && (
        <div className="sc-card-title">
          {iconName && <Icon name={iconName} />}
          {title}
        </div>
      )}
      {children}
    </CardElement>
  )
}
