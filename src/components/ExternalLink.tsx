import type { ReactNode } from 'react'
import type { Link } from '../content'

export default function ExternalLink({ label, href, className, children }: Link & { className?: string; children?: ReactNode }) {
  return (
    <a className={className} href={/^(https?:|mailto:)/i.test(href) ? href : undefined} target="_blank" rel="noreferrer">
      {children ?? label}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}
