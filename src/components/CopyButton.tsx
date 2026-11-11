import { useState } from 'react'

export default function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () =>
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })

  return (
    <button className="copy" onClick={copy} aria-label={copied ? done : label} title={copied ? done : label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {copied ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M9 4.5h6v3H9zM9 6H6.5v14h11V6H15" />}
      </svg>
    </button>
  )
}
