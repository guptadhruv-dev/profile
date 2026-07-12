import { useEffect, useState } from 'react'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function matchesQuery(query) {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches
  )
}

export function prefersReducedMotion() {
  return matchesQuery(reducedMotionQuery)
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => matchesQuery(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)
    mediaQuery.addEventListener('change', onChange)
    setMatches(mediaQuery.matches)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function usePrefersReducedMotion() {
  return useMediaQuery(reducedMotionQuery)
}

function matchesCssFlag(propertyName) {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim() === '1'
  )
}

export function useCssFlag(propertyName) {
  const [matches, setMatches] = useState(() => matchesCssFlag(propertyName))

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const updateMatch = () => setMatches(matchesCssFlag(propertyName))
    window.addEventListener('resize', updateMatch)
    updateMatch()
    return () => window.removeEventListener('resize', updateMatch)
  }, [propertyName])

  return matches
}
