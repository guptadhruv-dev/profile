import { prefersReducedMotion } from './media'

const smoothScrollTimeoutMilliseconds = 1500
const scrollCleanupByContainer = new WeakMap()
const missingAnchorListeners = new Set()

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

  target.scrollIntoView({ behavior: 'smooth', ...options })

  let fallbackTimer
  let isComplete = false
  const completeScroll = () => {
    if (isComplete) return
    isComplete = true
    clearTimeout(fallbackTimer)
    scroller.removeEventListener('scrollend', completeScroll)
    onComplete?.()
  }
  fallbackTimer = setTimeout(completeScroll, smoothScrollTimeoutMilliseconds)
  scroller.addEventListener('scrollend', completeScroll)

  const cleanup = () => {
    clearTimeout(fallbackTimer)
    scroller.removeEventListener('scrollend', completeScroll)
  }
  scrollCleanupByContainer.set(scroller, cleanup)
  return cleanup
}

export function onMissingAnchor(listener) {
  missingAnchorListeners.add(listener)
  return () => {
    missingAnchorListeners.delete(listener)
  }
}

export function scrollToAnchor(anchorId) {
  if (!anchorId) return
  const target = document.getElementById(anchorId)
  if (!target) {
    for (const listener of missingAnchorListeners) listener(anchorId)
    return
  }

  scrollElementIntoView(target.closest('.content-scroll'), target, { block: 'center' })

  target.classList.remove('ref-flash')
  void target.offsetWidth
  target.classList.add('ref-flash')
  target.addEventListener('animationend', () => target.classList.remove('ref-flash'), {
    once: true,
  })
}
