import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useContent } from '../src/hooks/use-content'

afterEach(() => vi.restoreAllMocks())

function deferred() {
  let resolvePromise
  const promise = new Promise((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

describe('content loading hook', () => {
  it('loads, validates, and sorts sections', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(new Response('["work.md","overview.md"]'))
      }
      if (contentPath === '/work.md') {
        return Promise.resolve(new Response('---\nrank: 2\n---\n# Work'))
      }
      return Promise.resolve(new Response('---\nrank: 1\n---\n# Overview'))
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.sections).toHaveLength(2))
    expect(result.current.status).toBe('success')
    expect(result.current.sections.map((section) => section.id)).toEqual(['overview', 'work'])
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/proxy?target=content&path=%2Findex.json',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('distinguishes empty content and supports retry after failure', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(new Response('[]'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(consoleError).toHaveBeenCalledOnce()
  })
  it('renders sections as they arrive instead of waiting for the slowest', async () => {
    const slowSection = deferred()
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(new Response('["overview.md","work.md"]'))
      }
      if (contentPath === '/overview.md') {
        return Promise.resolve(new Response('---\nrank: 1\n---\n# Overview'))
      }
      return slowSection.promise
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.sections.map((section) => section.id)).toEqual(['overview'])

    await act(async () => {
      slowSection.resolve(new Response('---\nrank: 2\n---\n# Work'))
      await slowSection.promise
    })
    await waitFor(() => expect(result.current.sections).toHaveLength(2))
    expect(result.current.sections.map((section) => section.id)).toEqual(['overview', 'work'])
  })

  it('keeps the page usable when a single section fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(new Response('["overview.md","work.md"]'))
      }
      if (contentPath === '/work.md') return Promise.resolve(new Response('nope', { status: 404 }))
      return Promise.resolve(new Response('---\nrank: 1\n---\n# Overview'))
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.sections.map((section) => section.id)).toEqual(['overview'])
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('reports an error only when every section fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(new Response('["overview.md","work.md"]'))
      }
      return Promise.resolve(new Response('missing', { status: 500 }))
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.sections).toEqual([])
  })
  it('renders navigable shells from a descriptor manifest before any body arrives', async () => {
    const slowBody = deferred()
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(
          new Response(
            '[{"file":"overview.md","rank":1,"label":"Overview","icon":"home"},' +
              '{"file":"work.md","rank":2,"label":"Work","icon":"work"}]',
          ),
        )
      }
      return slowBody.promise.then((bodyText) => new Response(bodyText))
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.sections).toEqual([
      { id: 'overview', label: 'Overview', rank: 1, vars: { icon: 'home' }, content: null },
      { id: 'work', label: 'Work', rank: 2, vars: { icon: 'work' }, content: null },
    ])

    await act(async () => {
      slowBody.resolve('# Body')
      await slowBody.promise
    })
    await waitFor(() => expect(result.current.sections[0].content).toBe('# Body'))
    expect(result.current.sections.map((section) => section.id)).toEqual(['overview', 'work'])
  })

  it('removes a descriptor section whose body fails instead of leaving a blank pane', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(
          new Response(
            '[{"file":"overview.md","rank":1,"label":"Overview"},' +
              '{"file":"work.md","rank":2,"label":"Work"}]',
          ),
        )
      }
      if (contentPath === '/overview.md') {
        return Promise.resolve(new Response('gone', { status: 404 }))
      }
      return Promise.resolve(new Response('# Work'))
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() =>
      expect(result.current.sections.map((section) => section.id)).toEqual(['work']),
    )

    act(() => result.current.requestSection('work'))
    await waitFor(() => expect(result.current.sections[0].content).toBe('# Work'))
    expect(result.current.status).toBe('success')
  })

  it('schedules descriptor bodies instead of requesting all of them at once', async () => {
    const requestedPaths = []
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      requestedPaths.push(contentPath)
      if (contentPath === '/index.json') {
        return Promise.resolve(
          new Response(
            '[{"file":"one.md","rank":1},{"file":"two.md","rank":2},{"file":"three.md","rank":3}]',
          ),
        )
      }
      return Promise.resolve(new Response(`# ${contentPath}`))
    })

    const { result } = renderHook(() => useContent())
    await waitFor(() => expect(result.current.sections).toHaveLength(3))
    await waitFor(() => expect(requestedPaths).toContain('/one.md'))

    expect(requestedPaths).not.toContain('/two.md')
    expect(requestedPaths).not.toContain('/three.md')

    act(() => result.current.requestSection('three'))
    await waitFor(() => expect(requestedPaths).toContain('/three.md'))
    expect(requestedPaths).not.toContain('/two.md')
    expect(requestedPaths.filter((path) => path === '/one.md')).toHaveLength(1)

    act(() => result.current.requestSection('one'))
    expect(requestedPaths.filter((path) => path === '/one.md')).toHaveLength(1)
  })

  it('ignores responses that arrive after a reload', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const staleManifest = deferred()
    let manifestRequestCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        manifestRequestCount += 1
        if (manifestRequestCount === 1) return staleManifest.promise
        return Promise.resolve(new Response('[]'))
      }
      return Promise.resolve(new Response('# Body'))
    })

    const { result } = renderHook(() => useContent())
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.status).toBe('empty'))

    await act(async () => {
      staleManifest.resolve(new Response('["overview.md"]'))
      await staleManifest.promise
    })

    expect(result.current.status).toBe('empty')
    expect(result.current.sections).toEqual([])
    expect(consoleError).not.toHaveBeenCalled()
  })
})
