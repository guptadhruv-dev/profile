import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import proxyHandler, { createUpstreamUrl } from '../api/proxy'

const originalProxyApiKey = process.env.key

beforeEach(() => {
  process.env.key = 'test-key'
})

afterEach(() => {
  process.env.key = originalProxyApiKey
  vi.restoreAllMocks()
})

describe('proxy path validation', () => {
  it('creates same-origin upstream URLs', () => {
    expect(
      createUpstreamUrl('https://data.example.com', '/Documents/file.pdf?download=1')?.href,
    ).toBe('https://data.example.com/Documents/file.pdf?download=1')
  })

  it.each([
    '/../secret',
    '/%2e%2e/secret',
    '/%252e%252e/secret',
    '/safe%2f..%2fsecret',
    '//evil.example/secret',
    'https://evil.example/secret',
  ])('rejects traversal and absolute paths', (unsafePath) => {
    expect(createUpstreamUrl('https://data.example.com', unsafePath)).toBeNull()
  })
})

describe('proxy handler', () => {
  it('rejects unsupported methods and targets', async () => {
    const postResponse = await proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=profile&path=/file', {
        method: 'POST',
      }),
    )
    const targetResponse = await proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=unknown&path=/file'),
    )
    expect(postResponse.status).toBe(405)
    expect(targetResponse.status).toBe(400)
  })

  it('fails closed when the proxy key is unavailable', async () => {
    delete process.env.key
    const response = await proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=profile&path=/profile'),
    )
    expect(response.status).toBe(500)
  })

  it('forwards approved headers and streams successful responses', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('profile', {
        status: 200,
        headers: { 'content-type': 'text/plain', 'x-private': 'hidden' },
      }),
    )
    const response = await proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=profile&path=/profile', {
        headers: { accept: 'text/plain', 'x-private': 'blocked' },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('profile')
    expect(response.headers.get('content-type')).toBe('text/plain')
    expect(response.headers.get('x-private')).toBeNull()
    expect(fetchMock.mock.calls[0][1].headers.get('accept')).toBe('text/plain')
    expect(fetchMock.mock.calls[0][1].headers.get('x-private')).toBeNull()
  })

  it('returns no body for HEAD requests and maps upstream failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 204 }))
    const headResponse = await proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=profile&path=/profile', {
        method: 'HEAD',
      }),
    )
    expect(headResponse.body).toBeNull()

    globalThis.fetch.mockRejectedValueOnce(new Error('offline'))
    const failedResponse = await proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=profile&path=/profile'),
    )
    expect(failedResponse.status).toBe(502)
  })

  it('times out stalled upstream requests', async () => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (upstreamUrl, requestOptions) =>
        new Promise((resolvePromise, rejectPromise) => {
          void upstreamUrl
          void resolvePromise
          requestOptions.signal.addEventListener('abort', () => rejectPromise(new Error('aborted')))
        }),
    )

    const responsePromise = proxyHandler.fetch(
      new Request('https://profile.example/api/proxy?target=profile&path=/profile'),
    )
    await vi.advanceTimersByTimeAsync(10000)
    const response = await responsePromise
    expect(response.status).toBe(504)
    vi.useRealTimers()
  })
})
