import { useCallback, useEffect, useRef, useState } from 'react'
import { proxyFileUrl } from '../lib/proxy'
import {
  createContentSection,
  createSectionShell,
  hasStableOrdering,
  parseContentManifest,
} from '../lib/content'
import { proxyTargetNames } from '../../shared/proxy-targets'

function contentUrl(filename) {
  return proxyFileUrl(proxyTargetNames.content, `/${filename}`)
}

async function fetchText(filename, signal) {
  const response = await fetch(contentUrl(filename), { signal })
  if (!response.ok) throw new Error(`Failed to fetch ${filename} (${response.status})`)
  return response.text()
}

function orderedSections(sectionSlots) {
  return sectionSlots
    .map((section, manifestIndex) => ({ section, manifestIndex }))
    .filter((slot) => slot.section !== null)
    .sort(
      (firstSlot, secondSlot) =>
        firstSlot.section.rank - secondSlot.section.rank ||
        firstSlot.manifestIndex - secondSlot.manifestIndex,
    )
    .map((slot) => slot.section)
}

export function useContent() {
  const [sections, setSections] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadVersion, setLoadVersion] = useState(0)
  const loadContextRef = useRef(null)

  const reload = useCallback(() => {
    setLoadVersion((currentVersion) => currentVersion + 1)
  }, [])

  const requestSection = useCallback((sectionId) => {
    loadContextRef.current?.requestSection(sectionId)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus('loading')
      setSections([])

      let descriptors
      try {
        descriptors = parseContentManifest(await fetchText('index.json', controller.signal))
      } catch (manifestError) {
        if (controller.signal.aborted || manifestError.name === 'AbortError') return
        console.error(manifestError)
        setSections([])
        setStatus('error')
        return
      }
      if (controller.signal.aborted) return

      if (descriptors.length === 0) {
        setStatus('empty')
        return
      }

      const isScheduled = hasStableOrdering(descriptors)
      const sectionSlots = descriptors.map((descriptor, manifestIndex) =>
        isScheduled ? createSectionShell(descriptor, manifestIndex) : null,
      )
      const requestedFilenames = new Set()
      let settledCount = 0
      let failureCount = 0

      const publish = () => {
        if (controller.signal.aborted) return
        const publishedSections = orderedSections(sectionSlots)
        setSections(publishedSections)
        if (publishedSections.length > 0) setStatus('success')
        else if (settledCount === descriptors.length) setStatus('error')
      }

      async function loadBody(descriptor, manifestIndex) {
        if (requestedFilenames.has(descriptor.filename)) return
        requestedFilenames.add(descriptor.filename)

        try {
          const sectionText = await fetchText(descriptor.filename, controller.signal)
          if (controller.signal.aborted) return
          settledCount += 1
          sectionSlots[manifestIndex] = createContentSection(descriptor, sectionText, manifestIndex)
        } catch (sectionError) {
          if (controller.signal.aborted || sectionError.name === 'AbortError') return
          settledCount += 1
          failureCount += 1
          sectionSlots[manifestIndex] = null
          console.error(sectionError)
        }
        publish()
      }

      const orderedIndexes = descriptors
        .map((descriptor, manifestIndex) => ({ descriptor, manifestIndex }))
        .sort(
          (firstEntry, secondEntry) =>
            (firstEntry.descriptor.rank ?? firstEntry.manifestIndex) -
              (secondEntry.descriptor.rank ?? secondEntry.manifestIndex) ||
            firstEntry.manifestIndex - secondEntry.manifestIndex,
        )

      loadContextRef.current = {
        requestSection(sectionId) {
          const requested = orderedIndexes.find(
            (entry) => entry.descriptor.filename.slice(0, -3) === sectionId,
          )
          if (requested) loadBody(requested.descriptor, requested.manifestIndex)
        },
      }

      if (isScheduled) {
        publish()
        await loadBody(orderedIndexes[0].descriptor, orderedIndexes[0].manifestIndex)
        return
      }

      await Promise.all(
        orderedIndexes.map((entry) => loadBody(entry.descriptor, entry.manifestIndex)),
      )
      if (controller.signal.aborted) return
      if (failureCount === descriptors.length) setStatus('error')
    }

    load()

    return () => {
      loadContextRef.current = null
      controller.abort()
    }
  }, [loadVersion])

  return { sections, status, reload, requestSection }
}
