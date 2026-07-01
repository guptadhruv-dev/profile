const TARGETS = {
  data: 'https://data.guptadhruv.dev',
  content: 'https://content.guptadhruv.dev',
}

const FORWARD_HEADERS = ['accept', 'range', 'if-none-match', 'if-modified-since', 'if-range']

const RESPONSE_HEADERS = [
  'accept-ranges',
  'cache-control',
  'content-disposition',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
]

function text(message, status) {
  return new Response(message, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

function upstreamUrl(origin, rawPath) {
  if (!rawPath || rawPath.includes('\0')) return null
  const trimmed = rawPath.trim()
  if (!trimmed || trimmed.startsWith('//') || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) return null

  const queryStart = trimmed.indexOf('?')
  const pathPart = queryStart === -1 ? trimmed : trimmed.slice(0, queryStart)
  const queryPart = queryStart === -1 ? '' : trimmed.slice(queryStart)
  const parts = pathPart.split('/').filter(Boolean)

  if (parts.some((part) => part === '..')) return null

  const url = new URL(origin)
  url.pathname = '/' + parts.join('/')
  url.search = queryPart
  return url
}

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return text('Method not allowed', 405)
    }

    const secret = process.env.key
    if (!secret) return text('Missing proxy key', 500)

    const url = new URL(request.url)
    const target = url.searchParams.get('target')
    const origin = TARGETS[target]
    if (!origin) return text('Invalid target', 400)

    const upstream = upstreamUrl(origin, url.searchParams.get('path'))
    if (!upstream) return text('Invalid path', 400)

    const headers = new Headers({ key: secret })
    for (const name of FORWARD_HEADERS) {
      const value = request.headers.get(name)
      if (value) headers.set(name, value)
    }

    let response
    try {
      response = await fetch(upstream, {
        method: request.method,
        headers,
      })
    } catch {
      return text('Bad gateway', 502)
    }

    const responseHeaders = new Headers()
    for (const name of RESPONSE_HEADERS) {
      const value = response.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }

    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  },
}
