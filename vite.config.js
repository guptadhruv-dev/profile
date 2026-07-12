import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { proxyTargetNames } from './shared/proxy-targets'
import { parseProxyPath } from './shared/proxy-path'

const debugVite = process.env.DEBUG_VITE === '1'
const localProxyRoots = Object.freeze({
  [proxyTargetNames.content]: path.resolve('local/pages/profile-content'),
  [proxyTargetNames.profile]: path.resolve('local/r2/profile'),
})
const contentTypes = Object.freeze({
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
})
const defaultContentType = 'application/octet-stream'
const proxyRoute = '/api/proxy'
const sensitiveFilePatterns = [
  '.env',
  '.env.*',
  '*.{crt,pem,key,p12,pfx,cer,der}',
  '.npmrc',
  '.yarnrc.yml',
  '**/.git/**',
  'local/**',
  '**/local/**',
]

function sendTextResponse(response, statusCode, message) {
  response.statusCode = statusCode
  response.setHeader('content-type', 'text/plain; charset=utf-8')
  response.setHeader('x-content-type-options', 'nosniff')
  response.end(message)
}

function parseByteRange(rangeHeader, fileSize) {
  if (!rangeHeader) return null
  const rangeMatch = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)
  if (!rangeMatch || (!rangeMatch[1] && !rangeMatch[2])) return false

  const requestedStart = rangeMatch[1] ? Number(rangeMatch[1]) : null
  const requestedEnd = rangeMatch[2] ? Number(rangeMatch[2]) : null
  const start = requestedStart ?? Math.max(fileSize - requestedEnd, 0)
  const end =
    requestedStart === null ? fileSize - 1 : Math.min(requestedEnd ?? fileSize - 1, fileSize - 1)

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end) {
    return false
  }
  return { start, end }
}

function createLocalProxyPlugin() {
  return {
    name: 'local-secure-proxy',
    apply: 'serve',
    configureServer(server) {
      const localRootPaths = Object.values(localProxyRoots)
      for (const localRootPath of localRootPaths) {
        server.watcher.add(localRootPath)
      }

      server.watcher.on('all', (eventType, changedPath) => {
        if (!localRootPaths.some((localRootPath) => changedPath.startsWith(localRootPath))) return
        if (debugVite) console.log(`[local-proxy] ${eventType}: ${changedPath}`)
        server.ws.send({ type: 'full-reload' })
      })

      server.middlewares.use(async (request, response, next) => {
        let requestUrl
        try {
          requestUrl = new URL(request.url, 'http://localhost')
        } catch {
          sendTextResponse(response, 400, 'Invalid request URL')
          return
        }
        if (requestUrl.pathname !== proxyRoute) {
          next()
          return
        }
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          sendTextResponse(response, 405, 'Method not allowed')
          return
        }

        const targetName = requestUrl.searchParams.get('target')
        const localRoot = Object.hasOwn(localProxyRoots, targetName)
          ? localProxyRoots[targetName]
          : null
        const parsedPath = parseProxyPath(requestUrl.searchParams.get('path'))
        if (!localRoot || !parsedPath) {
          sendTextResponse(response, 400, 'Invalid proxy request')
          return
        }

        const localFilePath = path.resolve(localRoot, ...parsedPath.pathSegments)
        if (!localFilePath.startsWith(`${localRoot}${path.sep}`)) {
          sendTextResponse(response, 400, 'Invalid proxy path')
          return
        }

        let fileStats
        try {
          fileStats = await stat(localFilePath)
        } catch {
          sendTextResponse(response, 404, 'File not found')
          return
        }
        if (!fileStats.isFile()) {
          sendTextResponse(response, 404, 'File not found')
          return
        }

        const byteRange = parseByteRange(request.headers.range, fileStats.size)
        if (byteRange === false) {
          response.statusCode = 416
          response.setHeader('content-range', `bytes */${fileStats.size}`)
          response.end()
          return
        }

        const start = byteRange?.start ?? 0
        const end = byteRange?.end ?? fileStats.size - 1
        response.statusCode = byteRange ? 206 : 200
        response.setHeader('accept-ranges', 'bytes')
        response.setHeader('cache-control', 'no-store')
        response.setHeader('content-length', String(end - start + 1))
        response.setHeader(
          'content-type',
          contentTypes[path.extname(localFilePath).toLowerCase()] ?? defaultContentType,
        )
        response.setHeader('x-content-type-options', 'nosniff')
        if (byteRange)
          response.setHeader('content-range', `bytes ${start}-${end}/${fileStats.size}`)

        if (request.method === 'HEAD' || fileStats.size === 0) {
          response.end()
          return
        }
        createReadStream(localFilePath, { start, end })
          .on('error', () => response.destroy())
          .pipe(response)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), createLocalProxyPlugin()],
  server: { fs: { deny: sensitiveFilePatterns } },
  build: { manifest: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*-test.{js,jsx}'],
    environmentOptions: { jsdom: { url: 'https://profile.test' } },
  },
})
