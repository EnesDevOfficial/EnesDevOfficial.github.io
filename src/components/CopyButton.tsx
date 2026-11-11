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
        {copied ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M8.5 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5M9.5 3h5a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8.5 11h7M8.5 14.5h7M8.5 18h4" />}
      </svg>
    </button>
  )
}
