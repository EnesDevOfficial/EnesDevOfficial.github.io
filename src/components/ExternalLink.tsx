import type { ReactNode } from 'react'
import type { Link } from '../content'

export default function ExternalLink({ label, href, className, children, arrow = true }: Link & { className?: string; children?: ReactNode; arrow?: boolean }) {
  return (
    <a className={className} href={/^(https?:|mailto:)/i.test(href) ? href : undefined} target="_blank" rel="noreferrer">
      {children ?? label}
      {arrow && <span aria-hidden="true"> ↗</span>}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}
