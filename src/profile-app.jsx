import { lazy, Suspense, useCallback, useMemo, useRef } from 'react'
import Sidebar from './components/profile-sidebar'
import { useContent } from './hooks/use-content'
import { useActiveSection } from './hooks/use-active-section'
import { scrollElementIntoView } from './lib/scroll'

const Section = lazy(() => import('./components/content-section'))

export default function App() {
  const { sections, status, reload } = useContent()
  const scrollContainerRef = useRef(null)
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections])
  const { activeId: activeSection, activateSection } = useActiveSection(
    scrollContainerRef,
    sectionIds,
  )

  const handleNavigationClick = useCallback(
    (sectionId) => {
      const scrollContainer = scrollContainerRef.current
      const targetSection = scrollContainer?.querySelector(`#${CSS.escape(sectionId)}`)
      if (!targetSection) return

      scrollElementIntoView(scrollContainer, targetSection, {}, activateSection(sectionId))
    },
    [activateSection],
  )

  if (status === 'loading') return <div className="app-status">Loading...</div>
  if (status === 'empty') return <div className="app-status">No content is available.</div>
  if (status === 'error') {
    return (
      <div className="app-status" role="alert">
        <span>Something went wrong.</span>
        <button type="button" onClick={reload}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onNavClick={handleNavigationClick}
        sections={sections}
      />
      <main ref={scrollContainerRef} className="content-scroll">
        <Suspense
          fallback={
            <div className="app-status" aria-live="polite">
              Rendering content...
            </div>
          }
        >
          {sections.map((section) => (
            <Section
              key={section.id}
              id={section.id}
              vars={section.vars}
              content={section.content}
            />
          ))}
        </Suspense>
      </main>
    </div>
  )
}
