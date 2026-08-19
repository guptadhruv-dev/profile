import { useState } from 'react'

const imageMimeTypes = Object.freeze({
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
})

function imageMimeType(imageUrl) {
  const extension = /\.([a-z0-9]+)(?:[?&#]|$)/i.exec(decodeURIComponent(imageUrl))?.[1]
  return imageMimeTypes[extension?.toLowerCase()] ?? null
}

export default function LazyImage({
  src,
  sources = [],
  alt = '',
  title,
  width,
  height,
  className,
  isEager = false,
  onError,
}) {
  const [hasSourceFailed, setHasSourceFailed] = useState(false)
  if (!src) return null

  const typedSources = hasSourceFailed
    ? []
    : sources
        .filter(Boolean)
        .map((sourceUrl) => ({ sourceUrl, mimeType: imageMimeType(sourceUrl) }))
        .filter((source) => source.mimeType !== null)

  const handleError = () => {
    if (typedSources.length > 0) {
      setHasSourceFailed(true)
      return
    }
    onError?.()
  }

  const image = (
    <img
      src={src}
      alt={alt}
      title={title}
      width={width}
      height={height}
      className={className}
      loading={isEager ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={isEager ? 'high' : 'low'}
      onError={handleError}
    />
  )

  if (typedSources.length === 0) return image

  return (
    <picture>
      {typedSources.map((source) => (
        <source key={source.sourceUrl} type={source.mimeType} srcSet={source.sourceUrl} />
      ))}
      {image}
    </picture>
  )
}
