import { prefersReducedMotion } from './media'

const smoothScrollTimeoutMilliseconds = 1500
const scrollCleanupByContainer = new WeakMap()

export function scrollElementIntoView(scroller, target, options = {}, onComplete) {
  if (!target) {
    onComplete?.()
    return () => undefined
  }

  const shouldScrollSmoothly = !prefersReducedMotion()

  if (!scroller || !shouldScrollSmoothly) {
    target.scrollIntoView({ behavior: 'auto', ...options })
    onComplete?.()
    return () => undefined
  }

  scrollCleanupByContainer.get(scroller)?.()

  scroller.style.scrollSnapType = 'none'
  target.scrollIntoView({ behavior: 'smooth', ...options })

  let fallbackTimer
  let isComplete = false
  const restoreScrollSnap = () => {
    scroller.style.scrollSnapType = ''
  }
  const completeScroll = () => {
    if (isComplete) return
    isComplete = true
    clearTimeout(fallbackTimer)
    scroller.removeEventListener('scrollend', completeScroll)
    restoreScrollSnap()
    onComplete?.()
  }
  fallbackTimer = setTimeout(completeScroll, smoothScrollTimeoutMilliseconds)
  scroller.addEventListener('scrollend', completeScroll)

  const cleanup = () => {
    clearTimeout(fallbackTimer)
    scroller.removeEventListener('scrollend', completeScroll)
    restoreScrollSnap()
  }
  scrollCleanupByContainer.set(scroller, cleanup)
  return cleanup
}

export function scrollToAnchor(anchorId) {
  if (!anchorId) return
  const target = document.getElementById(anchorId)
  if (!target) return

  scrollElementIntoView(target.closest('.content-scroll'), target, { block: 'center' })

  target.classList.remove('ref-flash')
  void target.offsetWidth
  target.classList.add('ref-flash')
  target.addEventListener('animationend', () => target.classList.remove('ref-flash'), {
    once: true,
  })
}
