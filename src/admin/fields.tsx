import { useState, type ReactNode } from 'react'
import { assetUrl } from '../content'

type Update<T> = (update: (current: T) => T) => void

type TextProps = { label: string; value: string; onChange: (value: string) => void; long?: boolean }

export function Text({ label, value, onChange, long }: TextProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {long ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} /> : <input value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  )
}

export function Words({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <Text label={`${label} (comma separated)`} value={value.join(',')} onChange={(text) => onChange(text.split(','))} />
}

type ImageProps = { label: string; value: string; onChange: (value: string) => void; upload: (file: File) => Promise<string> }

const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/x-icon']

export function Image({ label, value, onChange, upload }: ImageProps) {
  const [hint, setHint] = useState('')

  const send = (file?: File | null) => {
    if (!file || !imageTypes.includes(file.type)) return setHint('No PNG, JPEG, WebP, GIF or ICO image found')
    setHint('')
    upload(file).then(onChange, () => {})
  }

  const paste = async () => {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => imageTypes.includes(t))
        if (type) return send(new File([await item.getType(type)], `pasted.${type.split('/')[1]}`, { type }))
      }
      send(null)
    } catch {
      setHint('Clipboard access blocked, press Cmd+V now to paste')
    }
  }

  return (
    <div className="field" onPaste={(e) => send(e.clipboardData.files[0])}>
      <span>{label}</span>
      {value && <img className="preview" src={assetUrl(value)} alt="" />}
      <div className="row">
        <input
          type="file"
          accept={imageTypes.join(',')}
          aria-label={`Upload ${label}`}
          onChange={(e) => {
            send(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button type="button" onClick={paste}>
          Paste image
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      {hint && <span role="status">{hint}</span>}
    </div>
  )
}

type ListProps<T> = { label: string; items: T[]; blank: T; onChange: Update<T[]>; children: (item: T, set: Update<T>) => ReactNode }

export function List<T>({ label, items, blank, onChange, children }: ListProps<T>) {
  const move = (from: number, to: number) =>
    onChange((current) => {
      const next = [...current]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })

  return (
    <fieldset className="list">
      <legend>{label}</legend>
      {items.map((item, i) => (
        <div className="list-item" key={i}>
          {children(item, (update) => onChange((current) => current.map((old, j) => (j === i ? update(old) : old))))}
          <div className="row">
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${label} ${i + 1} up`}>
              ↑
            </button>
            <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${label} ${i + 1} down`}>
              ↓
            </button>
            <button type="button" className="danger" onClick={() => onChange((current) => current.filter((_, j) => j !== i))} aria-label={`Delete ${label} ${i + 1}`}>
              Delete
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange((current) => [...current, blank])}>
        + Add
      </button>
    </fieldset>
  )
}
