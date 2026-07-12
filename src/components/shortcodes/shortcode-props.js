const accentTokens = new Set(['info', 'tip', 'warning', 'danger', 'note'])
const themeColorTokens = new Set(['primary', 'secondary'])
const hexadecimalColorPattern = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const cssVariablePattern = /^var\(--(?:color|accent)-[a-z0-9-]+\)$/
const cssLengthPattern = /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vh|vw|vmin|vmax|ch|ex)?$/i
const aspectRatioPattern = /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/
const alignmentValues = new Set(['left', 'center', 'right', 'start', 'end', 'justify'])
const flexAlignmentValues = new Set([
  'start',
  'end',
  'center',
  'stretch',
  'flex-start',
  'flex-end',
  'space-between',
  'space-around',
  'space-evenly',
])

const safeStyleValidators = Object.freeze({
  gap: isSafeCssLength,
  rowGap: isSafeCssLength,
  columnGap: isSafeCssLength,
  textAlign: (value) => alignmentValues.has(value),
  alignItems: (value) => flexAlignmentValues.has(value),
  justifyContent: (value) => flexAlignmentValues.has(value),
})

export function readProps(node) {
  const rawProperties = node?.properties?.dataProps
  if (typeof rawProperties !== 'string') return {}
  try {
    const parsedProperties = JSON.parse(rawProperties)
    return parsedProperties &&
      typeof parsedProperties === 'object' &&
      !Array.isArray(parsedProperties)
      ? parsedProperties
      : {}
  } catch {
    return {}
  }
}

export function isSafeCssLength(value) {
  if (typeof value === 'number') return Number.isFinite(value)
  return typeof value === 'string' && cssLengthPattern.test(value.trim())
}

export function cssSize(value, fallback = null) {
  if (!isSafeCssLength(value)) return fallback
  return typeof value === 'number' ? `${value}px` : value.trim()
}

export function safeAspectRatio(value) {
  if (typeof value !== 'string') return null
  const normalizedValue = value.trim()
  return aspectRatioPattern.test(normalizedValue) ? normalizedValue : null
}

export function sizeStyle(width, align) {
  const style = {}
  if (width === 'full' || width === '100%') {
    style.width = '100%'
    style.maxWidth = 'none'
  } else {
    const validatedWidth = cssSize(width)
    if (validatedWidth) {
      style.width = '100%'
      style.maxWidth = validatedWidth
    }
  }

  if (align === 'center') {
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
  } else if (align === 'right') {
    style.marginLeft = 'auto'
    style.marginRight = '0'
  } else if (align === 'left') {
    style.marginRight = 'auto'
  }
  return style
}

export function cssStyle(value) {
  if (typeof value !== 'string') return {}

  const style = {}
  for (const declaration of value.split(';')) {
    const separatorIndex = declaration.indexOf(':')
    if (separatorIndex === -1) continue

    const property = declaration.slice(0, separatorIndex).trim()
    const propertyValue = declaration
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    const propertyKey = property.replace(/-([a-z])/g, (hyphenatedCharacter) =>
      hyphenatedCharacter[1].toUpperCase(),
    )
    const validator = safeStyleValidators[propertyKey]
    if (validator?.(propertyValue)) style[propertyKey] = propertyValue
  }

  return style
}

export function toIconName(value) {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

export function resolveColor(color, fallback = 'var(--color-fg-secondary)') {
  if (typeof color !== 'string' || color.trim().length === 0) return fallback

  const normalizedColor = color.trim().toLowerCase()
  if (hexadecimalColorPattern.test(normalizedColor) || cssVariablePattern.test(normalizedColor)) {
    return normalizedColor
  }
  if (themeColorTokens.has(normalizedColor)) return `var(--color-fg-${normalizedColor})`
  return accentTokens.has(normalizedColor) ? `var(--accent-${normalizedColor})` : fallback
}

export function normalizeAlignment(value) {
  if (typeof value !== 'string') return null
  const normalizedValue = value.trim().toLowerCase()
  return alignmentValues.has(normalizedValue) ? normalizedValue : null
}
