import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { cssSize, readProps, safeAspectRatio, sizeStyle } from './shortcode-props'
import { proxySectionMediaUrl } from '../../lib/proxy'
import Icon from './icon-shortcode'

const maximumGalleryImages = 50
const galleryFitValues = new Set(['cover', 'contain', 'fill', 'scale-down', 'none'])

function parseGalleryImages(value) {
  if (Array.isArray(value)) return value.slice(0, maximumGalleryImages)
  if (typeof value !== 'string') return []
  try {
    const parsedImages = JSON.parse(value)
    return Array.isArray(parsedImages) ? parsedImages.slice(0, maximumGalleryImages) : []
  } catch {
    return []
  }
}

export default function Gallery({ node }) {
  const { images, width, height, aspect, fit, align } = readProps(node)
  const slides = parseGalleryImages(images)
    .map((item) => (typeof item === 'string' ? { src: item } : item))
    .map((item) => ({ ...item, src: proxySectionMediaUrl(item?.src) }))
    .filter((item) => item.src)
  const [carouselRef, carouselApi] = useEmblaCarousel({ loop: slides.length > 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const updateSelectedIndex = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!carouselApi) return undefined
    updateSelectedIndex(carouselApi)
    carouselApi.on('select', updateSelectedIndex).on('reInit', updateSelectedIndex)
    return () => {
      carouselApi.off('select', updateSelectedIndex).off('reInit', updateSelectedIndex)
    }
  }, [carouselApi, updateSelectedIndex])

  if (slides.length === 0) return null

  const hasMultipleSlides = slides.length > 1
  const caption = slides[selectedIndex]?.caption
  const style = sizeStyle(width, align)
  const galleryHeight = cssSize(height)
  const galleryAspectRatio = safeAspectRatio(String(aspect ?? ''))
  const galleryFit = galleryFitValues.has(fit) ? fit : null

  if (galleryHeight) style['--gallery-height'] = galleryHeight
  if (galleryAspectRatio) style['--gallery-aspect'] = galleryAspectRatio
  if (galleryFit) style['--gallery-fit'] = galleryFit
  if (galleryHeight || galleryAspectRatio) style['--gallery-min-height'] = '0'

  return (
    <div className="sc-gallery" style={style}>
      <div className="sc-gallery-viewport" ref={carouselRef}>
        <div className="sc-gallery-container">
          {slides.map((image, imageIndex) => (
            <div className="sc-gallery-slide" key={`${image.src}-${imageIndex}`}>
              <img src={image.src} alt={image.alt || ''} loading="lazy" />
            </div>
          ))}
        </div>

        {hasMultipleSlides && (
          <>
            <button
              type="button"
              className="sc-gallery-arrow sc-gallery-prev"
              aria-label="Previous image"
              onClick={() => carouselApi?.scrollPrev()}
            >
              <Icon name="chevron_left" />
            </button>
            <button
              type="button"
              className="sc-gallery-arrow sc-gallery-next"
              aria-label="Next image"
              onClick={() => carouselApi?.scrollNext()}
            >
              <Icon name="chevron_right" />
            </button>
          </>
        )}
      </div>

      {caption && <div className="sc-gallery-caption">{caption}</div>}

      {hasMultipleSlides && (
        <div className="sc-gallery-dots">
          {slides.map((image, imageIndex) => (
            <button
              type="button"
              key={`${image.src}-dot-${imageIndex}`}
              className={`sc-gallery-dot${imageIndex === selectedIndex ? ' is-active' : ''}`}
              aria-label={`Show image ${imageIndex + 1}`}
              aria-current={imageIndex === selectedIndex ? 'true' : undefined}
              onClick={() => carouselApi?.scrollTo(imageIndex)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
