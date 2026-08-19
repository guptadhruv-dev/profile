import { readFile, stat } from 'node:fs/promises'

const manifestPath = new URL('../dist/.vite/manifest.json', import.meta.url)
const distUrl = new URL('../dist/', import.meta.url)
const maximumEntryBytes = 500000
const maximumChunkBytes = 450000
const maximumBytesByManifestSource = Object.freeze({
  'src/components/content-section.jsx': 380000,
  'src/components/highlighted-code-block.jsx': 100000,
})
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const scriptChunks = Object.entries(manifest).filter(([, chunk]) => chunk.file.endsWith('.js'))
const oversizedEntries = []

for (const [manifestSource, scriptChunk] of scriptChunks) {
  const chunkStats = await stat(new URL(scriptChunk.file, distUrl))
  const maximumBytes =
    maximumBytesByManifestSource[manifestSource] ??
    (scriptChunk.isEntry ? maximumEntryBytes : maximumChunkBytes)
  if (chunkStats.size > maximumBytes) {
    oversizedEntries.push(`${scriptChunk.file}: ${chunkStats.size} bytes (limit ${maximumBytes})`)
  }
}

for (const budgetedSource of Object.keys(maximumBytesByManifestSource)) {
  if (!scriptChunks.some(([manifestSource]) => manifestSource === budgetedSource)) {
    oversizedEntries.push(`${budgetedSource}: budgeted source is missing from the manifest`)
  }
}

if (oversizedEntries.length > 0) {
  process.stderr.write(`${oversizedEntries.join('\n')}\n`)
  process.exitCode = 1
}
