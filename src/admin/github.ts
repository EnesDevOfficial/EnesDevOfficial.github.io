const repo = 'https://api.github.com/repos/EnesDevOfficial/portfolio'

export class GitHubError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(token: string, path = '', init?: RequestInit): Promise<T> {
  const response = await fetch(path ? `${repo}/${path}` : repo, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) {
    const { message } = await response.json().catch(() => ({ message: response.statusText }))
    throw new GitHubError(`GitHub said ${response.status}: ${message}`, response.status)
  }
  return response.json()
}

export const canWrite = async (token: string) => (await request<{ permissions?: { push?: boolean } }>(token)).permissions?.push === true

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

const getSha = (token: string, path: string) =>
  request<{ sha: string }>(token, `contents/${path}`).then(
    ({ sha }) => sha,
    (error) => {
      if (error instanceof GitHubError && error.status === 404) return undefined
      throw error
    },
  )

export async function putFile(token: string, path: string, blob: Blob, message: string, isNew = false) {
  const sha = isNew ? undefined : await getSha(token, path)
  await request(token, `contents/${path}`, { method: 'PUT', body: JSON.stringify({ message, content: await toBase64(blob), sha }) })
}

export async function saveLocal(path: string, blob: Blob) {
  const response = await fetch(`/__cms?path=${encodeURIComponent(path)}`, { method: 'PUT', body: blob })
  if (!response.ok) throw new Error(`Could not save ${path}`)
}
