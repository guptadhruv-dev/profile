import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'theme-mode'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const PROTECTED_HOST_TARGETS = {
  'data.guptadhruv.dev': 'data',
  'content.guptadhruv.dev': 'content',
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  )
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    setReduced(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function externalLinkProps(href) {
  if (typeof href !== 'string' || href.length === 0) return {}
  const pdf = isPdfHref(href)
  if (href.startsWith('http') || href.startsWith('mailto:') || pdf) {
    const external = href.startsWith('http') || pdf
    return external ? { target: '_blank', rel: 'noreferrer' } : {}
  }
  return {}
}

export function proxyFileUrl(target, path) {
  const cleanPath = typeof path === 'string' && path.startsWith('/') ? path : `/${path ?? ''}`
  return `/api/proxy?target=${encodeURIComponent(target)}&path=${encodeURIComponent(cleanPath)}`
}

export function proxyProtectedUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return value
  try {
    const url = new URL(value)
    const target = PROTECTED_HOST_TARGETS[url.hostname]
    if (!target) return value
    return proxyFileUrl(target, `${url.pathname}${url.search}`)
  } catch {
    return value
  }
}

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

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'light'
  }
  return 'dark'
}
