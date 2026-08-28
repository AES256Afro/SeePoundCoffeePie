import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { build, preview } from 'vite'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const configFile = path.join(
  projectRoot,
  'scripts/practical-cpp-candidate.vite.config.mjs',
)
const outDir = path.join(projectRoot, '.vite/practical-cpp-candidate-e2e')
const host = '127.0.0.1'
const port = 4198

await build({
  build: {
    emptyOutDir: true,
    outDir,
  },
  configFile,
  logLevel: 'silent',
  root: projectRoot,
})

const server = await preview({
  build: { outDir },
  configFile,
  logLevel: 'silent',
  preview: {
    host,
    port,
    strictPort: true,
  },
  root: projectRoot,
})

console.log(`Practical C++ candidate preview is ready at http://${host}:${port}.`)

let closing = false
async function closeServer() {
  if (closing) return
  closing = true
  await new Promise((resolve) => server.httpServer.close(resolve))
}

process.once('SIGINT', () => void closeServer())
process.once('SIGTERM', () => void closeServer())

await new Promise((resolve) => server.httpServer.once('close', resolve))
