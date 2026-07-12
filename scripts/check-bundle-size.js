import { readFile, stat } from 'node:fs/promises'

const manifestPath = new URL('../dist/.vite/manifest.json', import.meta.url)
const distUrl = new URL('../dist/', import.meta.url)
const maximumEntryBytes = 500000
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const entryFiles = Object.values(manifest).filter(
  (chunk) => chunk.isEntry && chunk.file.endsWith('.js'),
)
const oversizedEntries = []

for (const entryFile of entryFiles) {
  const entryFileStats = await stat(new URL(entryFile.file, distUrl))
  if (entryFileStats.size > maximumEntryBytes) {
    oversizedEntries.push(`${entryFile.file}: ${entryFileStats.size} bytes`)
  }
}

if (oversizedEntries.length > 0) {
  process.stderr.write(`${oversizedEntries.join('\n')}\n`)
  process.exitCode = 1
}
