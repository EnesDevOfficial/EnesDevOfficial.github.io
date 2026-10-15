import react from '@vitejs/plugin-react'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const writable = /^(src\/content\.json|public\/uploads\/[\w-][\w.-]{0,120})$/
const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1):5174$/
const maxUpload = 8 * 1024 * 1024

const localCms = (): Plugin => ({
  name: 'local-cms',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__cms', async (request, response) => {
      const reply = (status: number) => {
        response.statusCode = status
        response.end()
      }
      const path = new URL(request.url ?? '', 'http://localhost').searchParams.get('path') ?? ''
      const origin = request.headers.origin
      if (request.method !== 'PUT' || request.headers['x-cms'] !== '1' || (origin && !localOrigin.test(origin))) return reply(403)
      if (!writable.test(path)) return reply(400)
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of request) {
        size += chunk.length
        if (size > maxUpload) return reply(413)
        chunks.push(chunk)
      }
      try {
        const file = resolve(server.config.root, path)
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, Buffer.concat(chunks))
        reply(200)
      } catch {
        reply(500)
      }
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
        .replace('href="/favicon.svg"', `href="/${/^uploads\/[\w-][\w.-]*$/.test(profile.favicon) ? profile.favicon : 'favicon.svg'}"`)
    },
  },
})

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityPolicy = (): Plugin => ({
  name: 'security-policy',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
    ),
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
  plugins: [react(), localCms(), pageMeta(), securityPolicy(), thirdPartyLicenses()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
