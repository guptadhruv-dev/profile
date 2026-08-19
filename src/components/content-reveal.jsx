import { usePrefersReducedMotion } from '../lib/media'
import { useInView } from '../hooks/use-in-view'
import { joinClassNames } from '../lib/class-names'

const revealIntersectionThreshold = 0
const revealRootMargin = '0px 0px -15% 0px'

export default function Reveal({ children, className }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [elementRef, isVisible] = useInView({
    rootMargin: revealRootMargin,
    threshold: revealIntersectionThreshold,
    enabled: !prefersReducedMotion,
  })

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
