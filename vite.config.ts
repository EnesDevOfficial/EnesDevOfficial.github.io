import react from '@vitejs/plugin-react'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const writable = /^(src\/content\.json|public\/uploads\/[\w.-]+)$/

const localCms = (): Plugin => ({
  name: 'local-cms',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__cms', async (request, response) => {
      const path = new URL(request.url ?? '', 'http://localhost').searchParams.get('path') ?? ''
      if (request.method !== 'PUT' || !writable.test(path)) {
        response.statusCode = 400
        return response.end()
      }
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(chunk)
      const file = resolve(server.config.root, path)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, Buffer.concat(chunks))
      response.end()
    })
  },
})

export default defineConfig({
  base: './',
  plugins: [react(), localCms()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
