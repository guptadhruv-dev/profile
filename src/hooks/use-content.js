import { useCallback, useEffect, useState } from 'react'
import { proxyFileUrl } from '../lib/proxy'
import { createContentSection, parseContentManifest } from '../lib/content'
import { proxyTargetNames } from '../../shared/proxy-targets'

function contentUrl(filename) {
  return proxyFileUrl(proxyTargetNames.content, `/${filename}`)
}

async function fetchText(filename, signal) {
  const response = await fetch(contentUrl(filename), { signal })
  if (!response.ok) throw new Error(`Failed to fetch ${filename} (${response.status})`)
  return response.text()
}

export function useContent() {
  const [sections, setSections] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [loadVersion, setLoadVersion] = useState(0)

  const reload = useCallback(() => {
    setLoadVersion((currentVersion) => currentVersion + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus('loading')
      setError(null)
      try {
        const manifest = await fetchText('index.json', controller.signal)
        const filenames = parseContentManifest(manifest)
        const loadedSections = await Promise.all(
          filenames.map(async (filename, manifestIndex) =>
            createContentSection(
              filename,
              await fetchText(filename, controller.signal),
              manifestIndex,
            ),
          ),
        )

        setSections(
          loadedSections.sort(
            (firstSection, secondSection) => firstSection.rank - secondSection.rank,
          ),
        )
        setStatus(loadedSections.length === 0 ? 'empty' : 'success')
      } catch (loadError) {
        if (loadError.name === 'AbortError') return
        console.error(loadError)
        setError(loadError)
        setSections([])
        setStatus('error')
      }
    }

    load()

    return () => {
      controller.abort()
    }
  }, [loadVersion])

  return { sections, status, error, reload }
}
