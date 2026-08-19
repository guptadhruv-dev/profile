import { lazy, Suspense } from 'react'
import { readProps } from './shortcode-props'
import { galleryStyle } from './gallery-style'

const Gallery = lazy(() => import('./gallery-shortcode'))

export default function DeferredGallery({ node }) {
  const galleryProps = readProps(node)

  return (
    <Suspense
      fallback={
        <div className="sc-gallery" style={galleryStyle(galleryProps)}>
          <div className="sc-gallery-pending" />
        </div>
      }
    >
      <Gallery node={node} />
    </Suspense>
  )
}
