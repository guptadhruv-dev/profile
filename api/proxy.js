import { proxyTargets } from '../shared/proxy-targets'
import { parseProxyPath } from '../shared/proxy-path'

const forwardedRequestHeaders = [
  'accept',
  'range',
  'if-none-match',
  'if-modified-since',
  'if-range',
]
const forwardedResponseHeaders = [
  'accept-ranges',
  'cache-control',
  'content-disposition',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
]
const upstreamTimeoutMilliseconds = 10000

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-content-type-options': 'nosniff',
    },
  })
}

export function createUpstreamUrl(origin, rawPath) {
  const parsedPath = parseProxyPath(rawPath)
  if (!parsedPath) return null

  const upstreamUrl = new URL(origin)
  upstreamUrl.pathname = `/${parsedPath.pathSegments.join('/')}`
  upstreamUrl.search = parsedPath.search
  return upstreamUrl
}

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return textResponse('Method not allowed', 405)
    }

    const proxyApiKey = process.env.key
    if (!proxyApiKey) return textResponse('Missing proxy key', 500)

    const requestUrl = new URL(request.url)
    const targetName = requestUrl.searchParams.get('target')
    const targetOrigin = Object.hasOwn(proxyTargets, targetName) ? proxyTargets[targetName] : null
    if (!targetOrigin) return textResponse('Invalid target', 400)

    const upstreamUrl = createUpstreamUrl(targetOrigin, requestUrl.searchParams.get('path'))
    if (!upstreamUrl) return textResponse('Invalid path', 400)

    const upstreamHeaders = new Headers({ key: proxyApiKey })
    for (const headerName of forwardedRequestHeaders) {
      const headerValue = request.headers.get(headerName)
      if (headerValue) upstreamHeaders.set(headerName, headerValue)
    }

    const abortController = new AbortController()
    let didTimeout = false
    const timeout = setTimeout(() => {
      didTimeout = true
      abortController.abort()
    }, upstreamTimeoutMilliseconds)
    const abortUpstreamRequest = () => abortController.abort()
    request.signal.addEventListener('abort', abortUpstreamRequest, { once: true })

    let upstreamResponse
    try {
      upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: upstreamHeaders,
        signal: abortController.signal,
      })
    } catch {
      return textResponse(didTimeout ? 'Gateway timeout' : 'Bad gateway', didTimeout ? 504 : 502)
    } finally {
      clearTimeout(timeout)
      request.signal.removeEventListener('abort', abortUpstreamRequest)
    }

    const responseHeaders = new Headers({ 'x-content-type-options': 'nosniff' })
    for (const headerName of forwardedResponseHeaders) {
      const headerValue = upstreamResponse.headers.get(headerName)
      if (headerValue) responseHeaders.set(headerName, headerValue)
    }

    return new Response(request.method === 'HEAD' ? null : upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  },
}
