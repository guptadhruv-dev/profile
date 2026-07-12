import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useContent } from '../src/hooks/use-content'

afterEach(() => vi.restoreAllMocks())

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
    await waitFor(() => expect(result.current.status).toBe('success'))
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
})
