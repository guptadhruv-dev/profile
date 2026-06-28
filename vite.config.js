import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const DEBUG = process.env.DEBUG_VITE === '1'

function watchExternalFolder(folderPath) {
  return {
    name: 'watch-external-folder',
    apply: 'serve',
    configureServer(server) {
      const absolutePath = path.resolve(folderPath)

      if (DEBUG) console.log(`[watch-external] Watching folder: ${absolutePath}`)

      if (!fs.existsSync(absolutePath)) {
        if (DEBUG) console.warn(`[watch-external] Folder does not exist: ${absolutePath}`)
        return
      }

      server.watcher.add(absolutePath)

      server.watcher.on('all', (eventType, changedPath) => {
        if (DEBUG) console.log(`[watch-external] Detected change: ${changedPath} (${eventType})`)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), watchExternalFolder('./.ignore/content')],
})
