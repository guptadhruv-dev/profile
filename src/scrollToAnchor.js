import { prefersReducedMotion } from './shared'
import { disableScrollSnap, enableScrollSnap } from './scrollSnap'

let cleanup = null

export function scrollToAnchor(id) {
  if (!id) return
  const target = document.getElementById(id)
  if (!target) return

  const reduced = prefersReducedMotion()

  const container = target.closest('.content-scroll')
  if (container) {
    if (cleanup) cleanup()
    disableScrollSnap('ref', container)
    const events = ['wheel', 'touchstart', 'pointerdown']
    const restore = () => {
      enableScrollSnap('ref', container)
      events.forEach((evt) => container.removeEventListener(evt, restore))
      cleanup = null
    }
    events.forEach((evt) => container.addEventListener(evt, restore, { passive: true }))
    cleanup = restore
  }

  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })

  target.classList.remove('ref-flash')
  void target.offsetWidth
  target.classList.add('ref-flash')
  target.addEventListener('animationend', () => target.classList.remove('ref-flash'), {
    once: true,
  })
}
