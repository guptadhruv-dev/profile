import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const inspectedRoots = ['api', 'docs', 'public', 'scripts', 'shared', 'src', 'test']
const ignoredDirectoryNames = new Set(['coverage', 'dist', 'node_modules'])
const reservedRootFilenames = new Set([
  'AGENTS.md',
  'eslint.config.js',
  'index.html',
  'package-lock.json',
  'package.json',
  'vite.config.js',
])
const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const commentTokensByExtension = Object.freeze({
  '.css': ['/*'],
  '.html': ['<!--'],
  '.svg': ['<!--'],
})

function hasCompliantFilename(filename, isRootFile) {
  if (isRootFile && reservedRootFilenames.has(filename)) return true
  const filenameParts = filename.split('.')
  const baseName = filenameParts[0]
  return kebabCasePattern.test(baseName)
}

async function inspectPath(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath)
  const entries = await readdir(absolutePath, { withFileTypes: true })
  const failures = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || ignoredDirectoryNames.has(entry.name)) continue
    const entryRelativePath = path.join(relativePath, entry.name)
    if (entry.isDirectory()) {
      if (!kebabCasePattern.test(entry.name)) failures.push(`${entryRelativePath}: directory name`)
      failures.push(...(await inspectPath(entryRelativePath)))
      continue
    }

    if (!hasCompliantFilename(entry.name, false)) failures.push(`${entryRelativePath}: filename`)
    const commentTokens = commentTokensByExtension[path.extname(entry.name)]
    if (!commentTokens) continue
    const fileContent = await readFile(path.join(projectRoot, entryRelativePath), 'utf8')
    for (const commentToken of commentTokens) {
      if (fileContent.includes(commentToken)) failures.push(`${entryRelativePath}: code comment`)
    }
  }

  return failures
}

const failures = []
for (const rootFilename of reservedRootFilenames) {
  if (!hasCompliantFilename(rootFilename, true)) failures.push(`${rootFilename}: filename`)
}
for (const inspectedRoot of inspectedRoots) {
  try {
    failures.push(...(await inspectPath(inspectedRoot)))
  } catch (inspectionError) {
    if (inspectionError.code !== 'ENOENT') throw inspectionError
  }
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join('\n')}\n`)
  process.exitCode = 1
}
