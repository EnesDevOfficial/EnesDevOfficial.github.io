import type { ReactNode } from 'react'
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

export function Image({ label, value, onChange, upload }: ImageProps) {
  return (
    <div className="field">
      <span>{label}</span>
      {value && <img className="preview" src={assetUrl(value)} alt="" />}
      <div className="row">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/x-icon"
          aria-label={`Upload ${label}`}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file).then(onChange, () => {})
            e.target.value = ''
          }}
        />
        {value && (
          <button type="button" onClick={() => onChange('')}>
            remove
          </button>
        )}
      </div>
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
              delete
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange((current) => [...current, blank])}>
        + add
      </button>
    </fieldset>
  )
}
