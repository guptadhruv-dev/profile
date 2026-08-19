const contentFilenamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/
const numericValuePattern = /^-?\d+(?:\.\d+)?$/
const iconNamePattern = /^[a-z0-9_]+$/

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

function parseManifestEntry(entry) {
  if (typeof entry === 'string') return { filename: entry, rank: null, label: null, icon: null }
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error('Content manifest contains an invalid entry')
  }

  const { file, rank, label, icon } = entry
  if (rank !== undefined && !Number.isFinite(rank)) {
    throw new Error('Content manifest contains an invalid descriptor rank')
  }
  if (label !== undefined && (typeof label !== 'string' || !label.trim())) {
    throw new Error('Content manifest contains an invalid descriptor label')
  }
  if (icon !== undefined && (typeof icon !== 'string' || !iconNamePattern.test(icon))) {
    throw new Error('Content manifest contains an invalid descriptor icon')
  }

  return {
    filename: file,
    rank: rank ?? null,
    label: label ?? null,
    icon: icon ?? null,
  }
}

export function parseContentManifest(rawManifest) {
  let manifestEntries
  try {
    manifestEntries = JSON.parse(rawManifest)
  } catch {
    throw new Error('Content manifest is not valid JSON')
  }

  if (!Array.isArray(manifestEntries)) throw new Error('Content manifest must be an array')

  const uniqueFilenames = new Set()
  const descriptors = manifestEntries.map(parseManifestEntry)
  for (const descriptor of descriptors) {
    if (
      typeof descriptor.filename !== 'string' ||
      !contentFilenamePattern.test(descriptor.filename)
    ) {
      throw new Error('Content manifest contains an invalid filename')
    }
    if (uniqueFilenames.has(descriptor.filename)) {
      throw new Error('Content manifest contains a duplicate filename')
    }
    uniqueFilenames.add(descriptor.filename)
  }

  return descriptors
}

export function hasStableOrdering(descriptors) {
  return descriptors.length > 0 && descriptors.every((descriptor) => descriptor.rank !== null)
}

export function createSectionShell(descriptor, manifestIndex) {
  const identifier = descriptor.filename.slice(0, -3)
  return {
    id: identifier,
    label: descriptor.label ?? identifier,
    rank: descriptor.rank ?? manifestIndex,
    vars: descriptor.icon ? { icon: descriptor.icon } : {},
    content: null,
  }
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

export function createContentSection(descriptor, rawContent, manifestIndex) {
  const { metadata, content } = parseFrontmatter(rawContent)
  const identifier = descriptor.filename.slice(0, -3)
  const frontmatterRank = Number.isFinite(metadata.rank) ? metadata.rank : manifestIndex
  const frontmatterLabel =
    typeof metadata.label === 'string' && metadata.label.trim() ? metadata.label : null

  return {
    id: identifier,
    label: descriptor.label ?? frontmatterLabel ?? identifier,
    rank: descriptor.rank ?? frontmatterRank,
    vars: descriptor.icon ? { ...metadata, icon: descriptor.icon } : metadata,
    content,
  }
}
