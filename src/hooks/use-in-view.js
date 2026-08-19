import { useEffect, useRef, useState } from 'react'

export function useInView({ rootRef = null, rootMargin, threshold = 0, enabled = true } = {}) {
  const elementRef = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!enabled || isInView) return undefined
    const element = elementRef.current
    if (!element) return undefined
    if (typeof IntersectionObserver !== 'function') {
      setIsInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setIsInView(true)
        observer.disconnect()
      },
      { root: rootRef?.current ?? null, rootMargin, threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, isInView, rootMargin, rootRef, threshold])

  return [elementRef, isInView]
}
