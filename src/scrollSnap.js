const tokens = new Set()

export function disableScrollSnap(token, container) {
  tokens.add(token)
  if (container) container.style.scrollSnapType = 'none'
}

export function enableScrollSnap(token, container) {
  tokens.delete(token)
  if (tokens.size === 0 && container) container.style.scrollSnapType = ''
}

export function isScrollSnapDisabled() {
  return tokens.size > 0
}
