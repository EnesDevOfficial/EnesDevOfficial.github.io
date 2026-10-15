import react from '@vitejs/plugin-react'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
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

const escape = (text: string) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`)

const pageMeta = (): Plugin => ({
  name: 'page-meta',
  transformIndexHtml: {
    order: 'pre',
    handler: async (html) => {
      const { site, profile, pages } = JSON.parse(await readFile(new URL('./src/content.json', import.meta.url), 'utf8'))
      return html
        .replace('<title></title>', `<title>${escape(`${pages.home.title} | ${site.name}`)}</title>`)
        .replace('content=""', `content="${escape(site.description)}"`)
        .replace('href="/favicon.svg"', `href="/${profile.favicon || 'favicon.svg'}"`)
    },
  },
})

const findPackage = (name: string, from: string): string | undefined => {
  const file = join(from, 'node_modules', name, 'package.json')
  if (existsSync(file)) return file
  return dirname(from) === from ? undefined : findPackage(name, dirname(from))
}

const thirdPartyLicenses = (): Plugin => ({
  name: 'third-party-licenses',
  apply: 'build',
  generateBundle() {
    const notices = new Map<string, string>()
    const visit = (name: string, from: string) => {
      const file = findPackage(name, from)
      if (!file) return
      const pkg = JSON.parse(readFileSync(file, 'utf8'))
      const id = `${pkg.name}@${pkg.version}`
      if (notices.has(id)) return
      const dir = dirname(file)
      const text = readdirSync(dir).find((entry) => /^(licen[cs]e|copying|ofl)/i.test(entry))
      notices.set(id, `${id} (${pkg.license ?? 'see license'})\n\n${text ? readFileSync(join(dir, text), 'utf8').trim() : pkg.license}`)
      Object.keys(pkg.dependencies ?? {}).forEach((dependency) => visit(dependency, dir))
    }
    const root = JSON.parse(readFileSync('package.json', 'utf8'))
    Object.keys(root.dependencies).forEach((dependency) => visit(dependency, process.cwd()))
    const source = ['This site includes the following open source software, each under its own license.', ...[...notices.values()].sort()].join(`\n\n${'-'.repeat(72)}\n\n`)
    this.emitFile({ type: 'asset', fileName: 'third-party-licenses.txt', source: `${source}\n` })
  },
})

export default defineConfig({
  base: './',
  plugins: [react(), localCms(), pageMeta(), thirdPartyLicenses()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
