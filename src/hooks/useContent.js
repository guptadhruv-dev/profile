import { useState, useEffect } from 'react'

const BASE_URL = import.meta.env.DEV ? '.ignore/content/' : 'https://data.guptadhruv.dev'

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { meta: {}, content: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { meta: {}, content: raw }
  const block = raw.slice(3, end).trim()
  const content = raw.slice(end + 4).trim()
  const meta = {}
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (val === 'true') meta[key] = true
    else if (val === 'false') meta[key] = false
    else if (/^\d+$/.test(val)) meta[key] = Number(val)
    else if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      meta[key] = val.slice(1, -1)
    else meta[key] = val
  }
  return { meta, content }
}

export function useContent() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    fetch(`${BASE_URL}/index.json`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch index (' + res.status + ')')
        return res.json()
      })
      .then((filenames) =>
        Promise.all(
          filenames.map((filename) =>
            fetch(`${BASE_URL}/${filename}`, { signal: controller.signal })
              .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch ' + filename)
                return res.text()
              })
              .then((raw) => {
                const { meta, content } = parseFrontmatter(raw)
                const id = filename.replace(/\.md$/, '')
                return { id, label: meta.label, rank: meta.rank, vars: meta, content }
              }),
          ),
        ),
      )
      .then((data) => {
        if (ignore) return
        setSections(data.sort((a, b) => a.rank - b.rank))
        setLoading(false)
      })
      .catch((err) => {
        if (ignore || err.name === 'AbortError') return
        console.error(err)
        setError(err)
        setLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  return { sections, loading, error }
}
