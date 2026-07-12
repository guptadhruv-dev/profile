import { readProps, sizeStyle } from './shortcode-props'
import { safeUrl } from '../../lib/proxy'

const youtubeIdentifierPattern = /^[A-Za-z0-9_-]{11}$/
const defaultEmbedWidthPixels = 640
const iframeSandbox = 'allow-scripts allow-same-origin allow-presentation'
const iframeCapabilities =
  'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share'

export default function Embed({ node }) {
  const { type, id, src, title, width, align } = readProps(node)
  let embedUrl = null

  if (type === 'youtube' && typeof id === 'string' && youtubeIdentifierPattern.test(id)) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${id}`
  } else {
    embedUrl = safeUrl(src, 'embed')
  }
  if (!embedUrl) return null

  return (
    <div className="sc-embed" style={sizeStyle(width ?? defaultEmbedWidthPixels, align ?? 'left')}>
      <iframe
        src={embedUrl}
        title={typeof title === 'string' && title.trim() ? title : 'Embedded content'}
        loading="lazy"
        allow={iframeCapabilities}
        sandbox={iframeSandbox}
        referrerPolicy="no-referrer"
        allowFullScreen
      />
    </div>
  )
}
