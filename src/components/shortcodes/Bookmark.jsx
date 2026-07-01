import { readProps, sizeStyle } from './props'
import { externalLinkProps, proxyProtectedUrl } from '../../shared'

export default function Bookmark({ node }) {
  const { href, title, description, image, width, align } = readProps(node)
  if (typeof href !== 'string' || href.length === 0) return null
  const proxiedHref = proxyProtectedUrl(href)
  const proxiedImage = proxyProtectedUrl(image)

  let host = href
  try {
    host = new URL(href).hostname.replace(/^www\./, '')
  } catch {
    host = href
  }

  return (
    <a
      className="sc-bookmark"
      style={sizeStyle(width, align)}
      href={proxiedHref}
      {...externalLinkProps(proxiedHref)}
    >
      <div className="sc-bookmark-text">
        {title && <div className="sc-bookmark-title">{title}</div>}
        {description && <div className="sc-bookmark-desc">{description}</div>}
        <div className="sc-bookmark-host">{host}</div>
      </div>
      {image && (
        <div className="sc-bookmark-image">
          <img src={proxiedImage} alt="" loading="lazy" />
        </div>
      )}
    </a>
  )
}
