import { cssSize, safeAspectRatio, sizeStyle } from './shortcode-props'

const galleryFitValues = new Set(['cover', 'contain', 'fill', 'scale-down', 'none'])

export function galleryStyle({ width, height, aspect, fit, align }) {
  const style = sizeStyle(width, align)
  const galleryHeight = cssSize(height)
  const galleryAspectRatio = safeAspectRatio(String(aspect ?? ''))
  const galleryFit = galleryFitValues.has(fit) ? fit : null

  if (galleryHeight) style['--gallery-height'] = galleryHeight
  if (galleryAspectRatio) style['--gallery-aspect'] = galleryAspectRatio
  if (galleryFit) style['--gallery-fit'] = galleryFit
  if (galleryHeight || galleryAspectRatio) style['--gallery-min-height'] = '0'

  return style
}
