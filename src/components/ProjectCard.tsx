import type { Project } from '../content'
import { shortUrl } from '../platforms'
import ExternalLink from './ExternalLink'
import Thumb from './Thumb'

export default function ProjectCard({ title, description, url, links, image, heading: Heading = 'h3' }: Project & { heading?: 'h2' | 'h3' }) {
  return (
    <article className="card">
      <Thumb className="thumb" src={image} label={title} lazy />
      <Heading>{url ? <ExternalLink className="card-link" label={title} href={url} arrow={false} /> : title}</Heading>
      <p className="domain" aria-hidden={!url}>{url ? shortUrl(url) : '\u00a0'}</p>
      <p>{description}</p>
      {links.length > 0 && (
        <div className="links">
          {links.map((link, i) => (
            <ExternalLink key={i} {...link} />
          ))}
        </div>
      )}
    </article>
  )
}
