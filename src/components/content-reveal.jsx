import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../lib/media'
import { joinClassNames } from '../lib/class-names'

const revealIntersectionThreshold = 0.2

export default function Reveal({ children, className }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return undefined
    const element = elementRef.current
    if (!element) return undefined
    if (typeof IntersectionObserver !== 'function') {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { threshold: revealIntersectionThreshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return <div className={className}>{children}</div>

  return (
    <div
      ref={elementRef}
      className={joinClassNames('reveal', isVisible && 'is-visible', className)}
    >
      {children}
    </div>
  )
}
