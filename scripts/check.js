import { spawnSync } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const checkScripts = ['directives:check', 'lint', 'format:check', 'test', 'build', 'bundle:check']

for (const checkScript of checkScripts) {
  const checkResult = spawnSync(npmCommand, ['run', checkScript], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
  if (checkResult.status === 0) continue
  process.exit(checkResult.status ?? 1)
}
