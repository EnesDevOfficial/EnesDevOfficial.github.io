import type { CSSProperties, ReactNode } from 'react'
import type { Link } from '../content'

type Props = Link & { className?: string; style?: CSSProperties; children?: ReactNode; arrow?: boolean }

export default function ExternalLink({ label, href, className, style, children, arrow = true }: Props) {
  return (
    <a className={className} style={style} href={/^(https?:|mailto:)/i.test(href) ? href : undefined} target="_blank" rel="noreferrer">
      {children ?? label}
      {arrow && <span aria-hidden="true"> ↗</span>}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}
