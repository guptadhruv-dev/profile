import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { readProps, sizeStyle } from './props';

function parseImages(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Gallery({ node }) {
  const { images, width, align } = readProps(node);
  const slides = parseImages(images)
    .map((item) => (typeof item === 'string' ? { src: item } : item))
    .filter((item) => item && typeof item.src === 'string');

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback((api) => setSelected(api.selectedScrollSnap()), []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect).off('reInit', onSelect); };
  }, [emblaApi, onSelect]);

  if (slides.length === 0) return null;

  const multiple = slides.length > 1;
  const caption  = slides[selected]?.caption;

  return (
    <div className="sc-gallery" style={sizeStyle(width, align)}>
      <div className="sc-gallery-viewport" ref={emblaRef}>
        <div className="sc-gallery-container">
          {slides.map((img, i) => (
            <div className="sc-gallery-slide" key={i}>
              <img src={img.src} alt={img.alt || ''} loading="lazy" />
            </div>
          ))}
        </div>

        {multiple && (
          <>
            <button
              type="button"
              className="sc-gallery-arrow sc-gallery-prev"
              aria-label="Previous image"
              onClick={() => emblaApi && emblaApi.scrollPrev()}
            >
              <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <button
              type="button"
              className="sc-gallery-arrow sc-gallery-next"
              aria-label="Next image"
              onClick={() => emblaApi && emblaApi.scrollNext()}
            >
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {caption && <div className="sc-gallery-caption">{caption}</div>}

      {multiple && (
        <div className="sc-gallery-dots">
          {slides.map((_, i) => (
            <button
              type="button"
              key={i}
              className={'sc-gallery-dot' + (i === selected ? ' is-active' : '')}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
