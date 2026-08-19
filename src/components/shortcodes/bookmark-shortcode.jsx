import { readProps, sizeStyle } from './shortcode-props'
import {
  externalLinkProps,
  proxyProtectedUrl,
  proxySectionMediaUrl,
  proxySectionMediaVariantUrl,
} from '../../lib/proxy'
import LazyImage from '../lazy-image'

export default function Bookmark({ node }) {
  const { href, title, description, image, width, align } = readProps(node)
  const bookmarkUrl = proxyProtectedUrl(href, 'link')
  if (!bookmarkUrl) return null

  const imageUrl = proxySectionMediaUrl(image)
  let bookmarkHostname = href
  try {
    bookmarkHostname = new URL(href).hostname.replace(/^www\./, '')
  } catch {
    bookmarkHostname = href
  }

  return (
    <a
      className="sc-bookmark"
      style={sizeStyle(width, align)}
      href={bookmarkUrl}
      {...externalLinkProps(bookmarkUrl)}
    >
      <div className="sc-bookmark-text">
        {title && <div className="sc-bookmark-title">{title}</div>}
        {description && <div className="sc-bookmark-desc">{description}</div>}
        <div className="sc-bookmark-host">{bookmarkHostname}</div>
      </div>
      {imageUrl && (
        <div className="sc-bookmark-image">
          <LazyImage src={imageUrl} sources={[proxySectionMediaVariantUrl(image)]} alt="" />
        </div>
      )}
    </a>
  )
}
