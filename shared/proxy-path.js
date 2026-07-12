const absoluteSchemePattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/
const maximumDecodePasses = 3

function repeatedlyDecode(value) {
  let decodedValue = value
  try {
    for (let decodePass = 0; decodePass < maximumDecodePasses; decodePass += 1) {
      const nextValue = decodeURIComponent(decodedValue)
      if (nextValue === decodedValue) break
      decodedValue = nextValue
    }
    return decodedValue
  } catch {
    return null
  }
}

export function parseProxyPath(rawPath) {
  if (typeof rawPath !== 'string' || rawPath.includes('\0')) return null
  const trimmedPath = rawPath.trim()
  if (
    !trimmedPath ||
    trimmedPath.startsWith('//') ||
    absoluteSchemePattern.test(trimmedPath) ||
    trimmedPath.includes('#')
  ) {
    return null
  }

  const queryStartIndex = trimmedPath.indexOf('?')
  const pathname = queryStartIndex === -1 ? trimmedPath : trimmedPath.slice(0, queryStartIndex)
  const search = queryStartIndex === -1 ? '' : trimmedPath.slice(queryStartIndex)
  const pathSegments = []

  for (const encodedSegment of pathname.split('/').filter(Boolean)) {
    const decodedSegment = repeatedlyDecode(encodedSegment)
    if (
      !decodedSegment ||
      decodedSegment === '.' ||
      decodedSegment === '..' ||
      decodedSegment.includes('/') ||
      decodedSegment.includes('\\') ||
      decodedSegment.includes('\0')
    ) {
      return null
    }
    pathSegments.push(decodedSegment)
  }

  return { pathSegments, search }
}
