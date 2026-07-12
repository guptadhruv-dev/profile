import { useCallback, useEffect, useRef, useState } from 'react'

const activeLineMargin = '-35% 0px -65% 0px'

export function useActiveSection(scrollContainerRef, sectionIds) {
  const [activeId, setActiveId] = useState('')
  const navigationId = useRef(0)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || sectionIds.length === 0) return undefined

    setActiveId((currentActiveId) => currentActiveId || sectionIds[0])

    if (typeof IntersectionObserver !== 'function') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && navigationId.current === 0) setActiveId(entry.target.id)
        }
      },
      { root: scrollContainer, rootMargin: activeLineMargin, threshold: 0 },
    )

    const observedSections = new Set()
    const observeSections = () => {
      for (const sectionId of sectionIds) {
        const section = scrollContainer.querySelector(`#${sectionId}`)
        if (!section || observedSections.has(section)) continue
        observedSections.add(section)
        observer.observe(section)
      }
    }
    observeSections()

    const mutationObserver =
      typeof MutationObserver === 'function' ? new MutationObserver(observeSections) : null
    mutationObserver?.observe(scrollContainer, { childList: true, subtree: true })
    return () => {
      mutationObserver?.disconnect()
      observer.disconnect()
    }
  }, [scrollContainerRef, sectionIds])

  const activateSection = useCallback((sectionId) => {
    const idForNavigation = navigationId.current + 1
    navigationId.current = idForNavigation
    setActiveId(sectionId)

    return () => {
      if (navigationId.current === idForNavigation) navigationId.current = 0
    }
  }, [])

  return { activeId, activateSection }
}
