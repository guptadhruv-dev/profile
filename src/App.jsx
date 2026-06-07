import { useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Section from './components/Section';
import { useContent } from './hooks/useContent';
import { transition } from './motion';

const TRIGGER_RATIO = 0.35;
const WHEEL_SNAP_THRESHOLD = 80;
const SECTION_EDGE_TOLERANCE = 16;
const SCROLL_LOCK_MS = Math.round(transition.duration * 1000 * 2.5);

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function normalizedWheelDelta(event, viewportHeight) {
  if (event.deltaMode === 1) return event.deltaY * 40;
  if (event.deltaMode === 2) return event.deltaY * viewportHeight;
  return event.deltaY;
}

function sectionIndexAtScrollTop(sections, scrollTop) {
  const index = sections.findIndex((section, i) => {
    const next = sections[i + 1];
    return scrollTop >= section.offsetTop - SECTION_EDGE_TOLERANCE
      && (!next || scrollTop < next.offsetTop - SECTION_EDGE_TOLERANCE);
  });

  return index === -1 ? 0 : index;
}

export default function App() {
  const { sections, loading } = useContent();
  const [activeSection, setActiveSection] = useState('');
  const scrollRef      = useRef(null);
  const lockedRef      = useRef(false);
  const wheelLockedRef = useRef(false);
  const lockTimeoutRef = useRef(null);

  useEffect(() => {
    if (sections.length && !activeSection) setActiveSection(sections[0].id);
  }, [sections, activeSection]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || sections.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      if (lockedRef.current) return;

      const containerTop  = container.getBoundingClientRect().top;
      const triggerOffset = container.clientHeight * TRIGGER_RATIO;
      const els           = container.querySelectorAll('section[id]');
      if (els.length === 0) return;

      const atBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 2;

      let currentId = els[0].id;
      if (atBottom) {
        currentId = els[els.length - 1].id;
      } else {
        for (const el of els) {
          if (el.getBoundingClientRect().top - containerTop <= triggerOffset) {
            currentId = el.id;
          } else {
            break;
          }
        }
      }

      setActiveSection(prev => (prev === currentId ? prev : currentId));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onScrollEnd = () => {
      lockedRef.current = false;
      wheelLockedRef.current = false;
      clearTimeout(lockTimeoutRef.current);
      update();
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('scrollend', onScrollEnd);
    update();

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('scrollend', onScrollEnd);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  const lockUntilScrollEnd = useCallback((id) => {
    lockedRef.current = true;
    setActiveSection(id);

    clearTimeout(lockTimeoutRef.current);
    lockTimeoutRef.current = setTimeout(() => {
      lockedRef.current = false;
      wheelLockedRef.current = false;
    }, SCROLL_LOCK_MS);
  }, []);

  const snapWheelToSection = useCallback((event) => {
    const container = scrollRef.current;
    if (!container) return false;
    if (wheelLockedRef.current) {
      event.preventDefault();
      return true;
    }
    if (container.style.scrollSnapType === 'none') return false;
    if (event.ctrlKey || event.metaKey || event.shiftKey) return false;

    const deltaY = normalizedWheelDelta(event, container.clientHeight);
    if (Math.abs(deltaY) < WHEEL_SNAP_THRESHOLD) return false;

    const els = [...container.querySelectorAll('section[id]')];
    if (els.length === 0) return false;

    const direction    = deltaY > 0 ? 1 : -1;
    const currentIndex = sectionIndexAtScrollTop(els, container.scrollTop);
    const current      = els[currentIndex];
    const sectionTop   = current.offsetTop;
    const sectionEnd   = sectionTop + current.offsetHeight;
    const viewportEnd  = container.scrollTop + container.clientHeight;

    if (direction > 0 && sectionEnd - viewportEnd > SECTION_EDGE_TOLERANCE) return false;
    if (direction < 0 && container.scrollTop - sectionTop > SECTION_EDGE_TOLERANCE) return false;

    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), els.length - 1);
    if (nextIndex === currentIndex) return false;

    event.preventDefault();
    wheelLockedRef.current = true;
    lockUntilScrollEnd(els[nextIndex].id);
    container.scrollTo({
      top:      els[nextIndex].offsetTop,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });

    return true;
  }, [lockUntilScrollEnd]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || sections.length === 0) return;

    const onWheel = (event) => {
      snapWheelToSection(event);
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [sections, snapWheelToSection]);

  const handleNavClick = useCallback((id) => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector('#' + CSS.escape(id));
    if (!target) return;

    lockUntilScrollEnd(id);
    container.scrollTo({
      top:      target.offsetTop,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [lockUntilScrollEnd]);

  useEffect(() => () => clearTimeout(lockTimeoutRef.current), []);

  if (loading) {
    return (
      <div style={{
        height:          '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: 'var(--color-bg-primary)',
        color:           'var(--color-fg-secondary)',
        fontFamily:      'var(--font-family)',
        fontSize:        '14px',
        letterSpacing:   '0.05em',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      display:         'flex',
      height:          '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      overflow:        'hidden',
    }}>
      <Sidebar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        sections={sections}
      />
      <main
        ref={scrollRef}
        className="content-scroll"
        style={{
          flex:            1,
          height:          '100vh',
          overflowY:       'auto',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        {sections.map((section, index) => (
          <Section
            key={section.id}
            id={section.id}
            vars={section.vars}
            content={section.content}
            isFirst={index === 0}
          />
        ))}
      </main>
    </div>
  );
}
