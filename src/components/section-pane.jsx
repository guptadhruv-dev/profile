import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { useInView } from '../hooks/use-in-view'

let sectionModulePromise = null

function importSection() {
  sectionModulePromise ??= import('./content-section')
  return sectionModulePromise
}

const Section = lazy(importSection)

export function preloadSection() {
  return importSection()
}

function CommittedSection({ id, vars, content, onBodyCommit }) {
  useEffect(() => {
    onBodyCommit?.(id)
  }, [content, id, onBodyCommit])

  return <Section vars={vars} content={content} />
}

function SectionPane({
  id,
  vars,
  content,
  scrollRootRef,
  mountLeadPixels = 0,
  isEager = false,
  isForced = false,
  onApproach,
  onBodyCommit,
}) {
  const [hasMountedBody, setHasMountedBody] = useState(isEager || isForced)
  const [elementRef, isInView] = useInView({
    rootRef: scrollRootRef,
    rootMargin: `${mountLeadPixels}px 0px ${mountLeadPixels}px 0px`,
    enabled: mountLeadPixels > 0 && !hasMountedBody && !isEager && !isForced,
  })
  const shouldRenderBody = hasMountedBody || isEager || isForced || isInView

  useEffect(() => {
    if (!shouldRenderBody) return
    setHasMountedBody(true)
    onApproach?.(id)
  }, [id, onApproach, shouldRenderBody])

  return (
    <section id={id} ref={elementRef} className="section-pane">
      {shouldRenderBody && content !== null ? (
        <Suspense fallback={<div className="section-pending" />}>
          <CommittedSection id={id} vars={vars} content={content} onBodyCommit={onBodyCommit} />
        </Suspense>
      ) : (
        <div className="section-pending" />
      )}
    </section>
  )
}

export default memo(SectionPane)
