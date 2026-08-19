import { useLayoutEffect, useState } from 'react'

export function useElementHeight(elementRef, watchToken) {
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const element = elementRef?.current
    if (!element) return undefined

    const updateHeight = () => setHeight(Math.round(element.getBoundingClientRect().height))
    updateHeight()

    if (typeof ResizeObserver !== 'function') {
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [elementRef, watchToken])

  return height
}
