import { proxyTargetByHostname, proxyTargetNames } from '../../shared/proxy-targets'
import { parseProxyPath } from '../../shared/proxy-path'

const absoluteSchemePattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/
const allowedProtocolsByKind = Object.freeze({
  link: new Set(['http:', 'https:', 'mailto:']),
  media: new Set(['http:', 'https:']),
  embed: new Set(['https:']),
})
const localUrlBase = 'https://local.invalid'
const defaultSectionMediaDirectory = 'media/sections'
const profileAssetFilenamePattern = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?\.[a-z0-9]+$/

function isPdfHref(href) {
  if (href.toLowerCase().endsWith('.pdf')) return true
  try {
    const url = new URL(href, 'https://proxy.local')
    const path = url.searchParams.get('path')
    return typeof path === 'string' && path.toLowerCase().endsWith('.pdf')
  } catch {
    return false
  }
}

export function externalLinkProps(href) {
  if (typeof href !== 'string' || href.length === 0) return {}
  let protocol
  try {
    protocol = new URL(href, localUrlBase).protocol
  } catch {
    return {}
  }
  if (protocol === 'http:' || protocol === 'https:' || isPdfHref(href)) {
    return { target: '_blank', rel: 'noopener noreferrer' }
  }
  return {}
}

export function safeUrl(value, kind = 'link') {
  if (typeof value !== 'string') return null
  const trimmedValue = value.trim()
  const allowedProtocols = allowedProtocolsByKind[kind]
  if (!trimmedValue || !allowedProtocols || trimmedValue.startsWith('//')) return null

  const hasAbsoluteScheme = absoluteSchemePattern.test(trimmedValue)
  if (!hasAbsoluteScheme && kind === 'embed') return null

  let parsedUrl
  try {
    parsedUrl = new URL(trimmedValue, localUrlBase)
  } catch {
    return null
  }

  if (!allowedProtocols.has(parsedUrl.protocol)) return null
  if (
    (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
    (parsedUrl.username || parsedUrl.password)
  ) {
    return null
  }

  return trimmedValue
}

export function proxyFileUrl(target, path) {
  const cleanPath = typeof path === 'string' && path.startsWith('/') ? path : `/${path ?? ''}`
  return `/api/proxy?target=${encodeURIComponent(target)}&path=${encodeURIComponent(cleanPath)}`
}

export function proxyProtectedUrl(value, kind = 'media') {
  const validatedValue = safeUrl(value, kind)
  if (!validatedValue) return null
  try {
    const url = new URL(validatedValue)
    const target = proxyTargetByHostname[url.hostname]
    if (!target) return validatedValue
    if (target === proxyTargetNames.profile) {
      return proxyProfileAssetUrl(`${url.pathname}${url.search}`)
    }
    return proxyFileUrl(target, `${url.pathname}${url.search}`)
  } catch {
    return validatedValue
  }
}

export function proxyProfileAssetUrl(value, defaultDirectory = null) {
  const validatedValue = safeUrl(value, 'media')
  if (!validatedValue) return null

  let rawAssetPath = validatedValue
  try {
    const assetUrl = new URL(validatedValue)
    if (proxyTargetByHostname[assetUrl.hostname] !== proxyTargetNames.profile || assetUrl.search) {
      return null
    }
    rawAssetPath = assetUrl.pathname
  } catch {
    rawAssetPath = validatedValue
  }

  const bucketRelativePath = rawAssetPath.replace(/^\/+/, '')
  const isBareFilename = rawAssetPath === bucketRelativePath && !bucketRelativePath.includes('/')
  const defaultedPath =
    defaultDirectory && isBareFilename
      ? `${defaultDirectory}/${bucketRelativePath}`
      : bucketRelativePath
  const normalizedPath = `/${defaultedPath.toLowerCase()}`
  const parsedPath = parseProxyPath(normalizedPath)
  const filename = parsedPath?.pathSegments.at(-1)
  if (
    !parsedPath ||
    parsedPath.search ||
    parsedPath.pathSegments.length === 0 ||
    !profileAssetFilenamePattern.test(filename)
  ) {
    return null
  }

  return proxyFileUrl(proxyTargetNames.profile, `/${parsedPath.pathSegments.join('/')}`)
}

export function proxySectionMediaUrl(value) {
  return proxyProfileAssetUrl(value, defaultSectionMediaDirectory)
}
