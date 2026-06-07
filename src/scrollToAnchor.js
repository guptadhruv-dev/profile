let cleanup = null;

export function scrollToAnchor(id) {
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;

  const reduced = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const container = target.closest('.content-scroll');
  if (container) {
    if (cleanup) cleanup();
    container.style.scrollSnapType = 'none';
    const events = ['wheel', 'touchstart', 'pointerdown'];
    const restore = () => {
      container.style.scrollSnapType = '';
      events.forEach((evt) => container.removeEventListener(evt, restore));
      cleanup = null;
    };
    events.forEach((evt) => container.addEventListener(evt, restore, { passive: true }));
    cleanup = restore;
  }

  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });

  target.classList.remove('ref-flash');
  void target.offsetWidth;
  target.classList.add('ref-flash');
  target.addEventListener('animationend', () => target.classList.remove('ref-flash'), { once: true });
}
