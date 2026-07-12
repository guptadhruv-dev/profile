const contentFilenamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/
const numericValuePattern = /^-?\d+(?:\.\d+)?$/

function parseFrontmatterValue(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  if (numericValuePattern.test(value)) return Number(value)
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1)
  }
  return value
}

export function parseContentManifest(rawManifest) {
  let filenames
  try {
    filenames = JSON.parse(rawManifest)
  } catch {
    throw new Error('Content manifest is not valid JSON')
  }

  if (!Array.isArray(filenames)) throw new Error('Content manifest must be an array')

  const uniqueFilenames = new Set()
  for (const filename of filenames) {
    if (typeof filename !== 'string' || !contentFilenamePattern.test(filename)) {
      throw new Error('Content manifest contains an invalid filename')
    }
    if (uniqueFilenames.has(filename)) {
      throw new Error('Content manifest contains a duplicate filename')
    }
    uniqueFilenames.add(filename)
  }

  return filenames
}

export function parseFrontmatter(rawContent) {
  const normalizedContent = String(rawContent ?? '').replace(/\r\n/g, '\n')
  if (!normalizedContent.startsWith('---\n')) return { metadata: {}, content: normalizedContent }

  const closingFenceIndex = normalizedContent.indexOf('\n---\n', 4)
  if (closingFenceIndex === -1) return { metadata: {}, content: normalizedContent }

  const frontmatterBlock = normalizedContent.slice(4, closingFenceIndex)
  const content = normalizedContent.slice(closingFenceIndex + 5).trim()
  const metadata = {}

  for (const line of frontmatterBlock.split('\n')) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (!key) continue
    metadata[key] = parseFrontmatterValue(value)
  }

  return { metadata, content }
}

export function createContentSection(filename, rawContent, manifestIndex) {
  const { metadata, content } = parseFrontmatter(rawContent)
  const identifier = filename.slice(0, -3)
  const rank = Number.isFinite(metadata.rank) ? metadata.rank : manifestIndex

  return {
    id: identifier,
    label:
      typeof metadata.label === 'string' && metadata.label.trim() ? metadata.label : identifier,
    rank,
    vars: metadata,
    content,
  }
}
