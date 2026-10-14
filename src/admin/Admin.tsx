import { useEffect, useState, type FormEvent } from 'react'
import { previews, publishedContent, setContent, useContent, type Content } from '../content'
import { Image, List, Text, Words } from './fields'
import { canWrite, GitHubError, putFile, saveLocal } from './github'

const storage = {
  get: () => {
    try {
      return sessionStorage.getItem('github-token') ?? ''
    } catch {
      return ''
    }
  },
  set: (token: string) => {
    try {
      if (token) sessionStorage.setItem('github-token', token)
      else sessionStorage.removeItem('github-token')
    } catch {}
  },
}

const maxUpload = 5 * 1024 * 1024

const local = import.meta.env.DEV

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error))

const update =
  <K extends keyof Content>(key: K) =>
  (next: (current: Content[K]) => Content[K]) =>
    setContent((content) => ({ ...content, [key]: next(content[key]) }))

const updateProfile = (field: keyof Content['profile']) => (value: string) => update('profile')((profile) => ({ ...profile, [field]: value }))

function Login({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const value = token.trim()
    setStatus('Verifying...')
    try {
      if (!(await canWrite(value))) throw new Error('This token has no access to the portfolio repo.')
      storage.set(value)
      onUnlock(value)
    } catch (error) {
      setStatus(errorText(error))
    }
  }

  return (
    <section className="content admin-login">
      <p className="eyebrow">Admin</p>
      <h1>Restricted</h1>
      <form onSubmit={submit} className="form-card">
        <label className="field">
          <span>GitHub token</span>
          <input type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <button className="button primary" disabled={!token.trim()}>
          Unlock
        </button>
        <p className="dim" role="status">
          {status}
        </p>
      </form>
    </section>
  )
}

function Editor({ token, onLock }: { token: string; onLock?: () => void }) {
  const content = useContent()
  const [saved, setSaved] = useState(publishedContent)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const { profile } = content
  const dirty = content !== saved
  const save = (path: string, blob: Blob, message: string, isNew?: boolean) => (local ? saveLocal(path, blob) : putFile(token, path, blob, message, isNew))

  const run = async <T,>(label: string, task: () => Promise<T>) => {
    setBusy(true)
    setStatus(label)
    try {
      return await task()
    } catch (error) {
      setStatus(errorText(error))
      throw error
    } finally {
      setBusy(false)
    }
  }

  const upload = (file: File) => {
    if (file.size > maxUpload) {
      setStatus(`${file.name} is over 5 MB, pick a smaller image`)
      return Promise.reject()
    }
    const path = `uploads/${Date.now()}-${file.name.replace(/[^\w.-]/g, '-')}`
    return run(`uploading ${file.name}...`, async () => {
      await save(`public/${path}`, file, `Upload ${file.name} from CMS`, true)
      previews.set(path, URL.createObjectURL(file))
      setStatus(`uploaded ${file.name}, ${local ? 'Save' : 'Publish'} to use it`)
      return path
    })
  }

  const publish = () =>
    run(local ? 'saving...' : 'publishing...', async () => {
      const json = JSON.stringify(content, (key, value) => (key === 'items' ? value.map((word: string) => word.trim()).filter(Boolean) : value), 2)
      await save('src/content.json', new Blob([`${json}\n`]), 'Update content from CMS')
      setSaved(content)
      setStatus(local ? 'saved to your project files, commit and push to go live' : 'published, live in about a minute')
    }).catch(() => {})

  return (
    <section className="content admin">
      <div className="admin-bar">
        <span className="dim" role="status">
          {status || (dirty ? 'Unsaved changes' : 'No changes')}
        </span>
        <button onClick={() => setContent(saved)} disabled={busy || !dirty}>
          Discard
        </button>
        <button className="button primary" onClick={publish} disabled={busy || !dirty}>
          {local ? 'Save' : 'Publish'}
        </button>
        {onLock && (
          <button onClick={onLock} disabled={busy}>
            Lock
          </button>
        )}
      </div>
      <p className="eyebrow">Admin</p>
      <h1>Control panel</h1>
      <p className="dim">
        Edits show across the site instantly so you can preview them. {local ? 'Save writes them to your project files.' : 'Publish commits them to GitHub.'}
      </p>

      <fieldset className="editor" disabled={busy}>
        <fieldset className="list">
          <legend>profile</legend>
          <Text label="name" value={profile.name} onChange={updateProfile('name')} />
          <Text label="handle" value={profile.handle} onChange={updateProfile('handle')} />
          <Text label="tagline" value={profile.tagline} onChange={updateProfile('tagline')} />
          <Text label="story (home page)" long value={profile.story} onChange={updateProfile('story')} />
          <Image label="avatar" value={profile.avatar} upload={upload} onChange={updateProfile('avatar')} />
          <Image label="favicon (square png, 64x64 or bigger)" value={profile.favicon} upload={upload} onChange={updateProfile('favicon')} />
        </fieldset>

        <List label="socials" items={content.socials} blank={{ label: '', href: 'https://' }} onChange={update('socials')}>
          {(link, set) => (
            <>
              <Text label="label" value={link.label} onChange={(label) => set((old) => ({ ...old, label }))} />
              <Text label="url" value={link.href} onChange={(href) => set((old) => ({ ...old, href }))} />
            </>
          )}
        </List>

        <List
          label="projects"
          items={content.projects}
          blank={{ title: 'New project', description: '', url: '', links: [], image: '', featured: false }}
          onChange={update('projects')}
        >
          {(project, set) => (
            <>
              <Text label="title" value={project.title} onChange={(title) => set((old) => ({ ...old, title }))} />
              <Text label="description" long value={project.description} onChange={(description) => set((old) => ({ ...old, description }))} />
              <Text label="link (opens when the card is clicked)" value={project.url} onChange={(url) => set((old) => ({ ...old, url }))} />
              <label className="check">
                <input type="checkbox" checked={project.featured} onChange={(e) => set((old) => ({ ...old, featured: e.target.checked }))} />
                featured on home
              </label>
              <Image label="image" value={project.image} upload={upload} onChange={(image) => set((old) => ({ ...old, image }))} />
              <List label="links" items={project.links} blank={{ label: 'Code', href: 'https://' }} onChange={(next) => set((old) => ({ ...old, links: next(old.links) }))}>
                {(link, setLink) => (
                  <div className="row">
                    <Text label="label" value={link.label} onChange={(label) => setLink((old) => ({ ...old, label }))} />
                    <Text label="url" value={link.href} onChange={(href) => setLink((old) => ({ ...old, href }))} />
                  </div>
                )}
              </List>
            </>
          )}
        </List>

        <List label="about paragraphs" items={content.about} blank="" onChange={update('about')}>
          {(paragraph, set) => <Text label="paragraph" long value={paragraph} onChange={(text) => set(() => text)} />}
        </List>

        <List label="timeline" items={content.timeline} blank={{ year: '', title: '', text: '' }} onChange={update('timeline')}>
          {(entry, set) => (
            <>
              <Text label="year (optional)" value={entry.year} onChange={(year) => set((old) => ({ ...old, year }))} />
              <Text label="title" value={entry.title} onChange={(title) => set((old) => ({ ...old, title }))} />
              <Text label="text" value={entry.text} onChange={(text) => set((old) => ({ ...old, text }))} />
            </>
          )}
        </List>

        <List label="skills" items={content.skills} blank={{ area: '', items: [] }} onChange={update('skills')}>
          {(group, set) => (
            <>
              <Text label="area" value={group.area} onChange={(area) => set((old) => ({ ...old, area }))} />
              <Words label="skills" value={group.items} onChange={(items) => set((old) => ({ ...old, items }))} />
            </>
          )}
        </List>
      </fieldset>
    </section>
  )
}

export default function Admin() {
  return local ? <Editor token="" /> : <Remote />
}

function Remote() {
  const [token, setToken] = useState(storage.get)
  const [verified, setVerified] = useState(false)

  const lock = () => {
    storage.set('')
    setContent(publishedContent)
    setToken('')
    setVerified(false)
  }

  useEffect(() => {
    if (!token || verified) return
    canWrite(token).then(
      (ok) => (ok ? setVerified(true) : lock()),
      (error) => (error instanceof GitHubError && (error.status === 401 || error.status === 403) ? lock() : setVerified(true)),
    )
  }, [token, verified])

  if (!token)
    return (
      <Login
        onUnlock={(next) => {
          setToken(next)
          setVerified(true)
        }}
      />
    )
  if (!verified) return <p className="content loading">Verifying</p>
  return <Editor token={token} onLock={lock} />
}
