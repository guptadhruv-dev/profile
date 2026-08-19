import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/profile-sidebar'
import SectionPane from './components/section-pane'
import { useContent } from './hooks/use-content'
import { useActiveSection } from './hooks/use-active-section'
import { useElementHeight } from './hooks/use-element-size'
import { onMissingAnchor, scrollElementIntoView, scrollToAnchor } from './lib/scroll'

export default function App() {
  const { sections, status, reload, requestSection } = useContent()
  const scrollContainerRef = useRef(null)
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections])
  const { activeId: activeSection, activateSection } = useActiveSection(
    scrollContainerRef,
    sectionIds,
  )
  const scrollRootHeight = useElementHeight(scrollContainerRef, status)
  const [forcedSectionIds, setForcedSectionIds] = useState(() => new Set())
  const [hasFullMount, setHasFullMount] = useState(false)
  const [committedSectionIds, setCommittedSectionIds] = useState(() => new Set())
  const [navigationRequest, setNavigationRequest] = useState(null)
  const [anchorRequest, setAnchorRequest] = useState(null)

  const handleSectionApproach = useCallback(
    (sectionId) => {
      requestSection(sectionId)
      const nextSectionId = sectionIds[sectionIds.indexOf(sectionId) + 1]
      if (nextSectionId) requestSection(nextSectionId)
    },
    [requestSection, sectionIds],
  )

  const handleBodyCommit = useCallback((sectionId) => {
    setCommittedSectionIds((currentIds) =>
      currentIds.has(sectionId) ? currentIds : new Set([...currentIds, sectionId]),
    )
  }, [])

  const handleNavigationClick = useCallback(
    (sectionId) => {
      const targetIndex = sectionIds.indexOf(sectionId)
      if (targetIndex < 0) return

      const activeIndex = Math.max(sectionIds.indexOf(activeSection), 0)
      const firstIndex = Math.min(activeIndex, targetIndex)
      const lastIndex = Math.max(activeIndex, targetIndex)
      const requiredSectionIds = sectionIds.slice(firstIndex, lastIndex + 1)

      for (const requiredSectionId of requiredSectionIds) requestSection(requiredSectionId)
      setForcedSectionIds((currentIds) => new Set([...currentIds, ...requiredSectionIds]))
      setNavigationRequest((currentRequest) => ({
        sectionId,
        requiredSectionIds,
        ticket: (currentRequest?.ticket ?? 0) + 1,
      }))
    },
    [activeSection, requestSection, sectionIds],
  )

  useEffect(() => {
    if (!navigationRequest) return

    const isSettled = (sectionId) => {
      const section = sections.find((entry) => entry.id === sectionId)
      return !section || committedSectionIds.has(sectionId)
    }
    if (!committedSectionIds.has(navigationRequest.sectionId)) return
    if (!navigationRequest.requiredSectionIds.every(isSettled)) return

    const scrollContainer = scrollContainerRef.current
    const targetElement = scrollContainer?.querySelector(
      `#${CSS.escape(navigationRequest.sectionId)}`,
    )
    if (!targetElement) return

    setNavigationRequest(null)
    scrollElementIntoView(
      scrollContainer,
      targetElement,
      {},
      activateSection(navigationRequest.sectionId),
    )
  }, [activateSection, committedSectionIds, navigationRequest, sections])

  useEffect(
    () =>
      onMissingAnchor((anchorId) => {
        setAnchorRequest((currentRequest) => ({
          anchorId,
          ticket: (currentRequest?.ticket ?? 0) + 1,
        }))
      }),
    [],
  )

  useEffect(() => {
    if (!anchorRequest) return
    setHasFullMount(true)
    for (const sectionId of sectionIds) requestSection(sectionId)
    if (!document.getElementById(anchorRequest.anchorId)) return

    setAnchorRequest(null)
    scrollToAnchor(anchorRequest.anchorId)
  }, [anchorRequest, committedSectionIds, hasFullMount, requestSection, sectionIds, sections])

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
        {sections.map((section, sectionIndex) => (
          <SectionPane
            key={section.id}
            id={section.id}
            vars={section.vars}
            content={section.content}
            scrollRootRef={scrollContainerRef}
            mountLeadPixels={scrollRootHeight}
            isEager={sectionIndex === 0}
            isForced={hasFullMount || forcedSectionIds.has(section.id)}
            onApproach={handleSectionApproach}
            onBodyCommit={handleBodyCommit}
          />
        ))}
      </main>
    </div>
  )
}
