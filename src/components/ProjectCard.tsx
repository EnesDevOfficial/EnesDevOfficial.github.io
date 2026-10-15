import { motion } from 'motion/react'
import type { PointerEvent } from 'react'
import type { Project } from '../content'
import ExternalLink from './ExternalLink'
import Thumb from './Thumb'

type Props = Project & { index: number; heading?: 'h2' | 'h3' }

const spotlight = (event: PointerEvent<HTMLElement>) => {
  const box = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - box.left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - box.top}px`)
}

export default function ProjectCard({ title, description, url, links, image, index, heading: Heading = 'h3' }: Props) {
  return (
    <motion.article
      className="card"
      onPointerMove={spotlight}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <Thumb className="thumb" src={image} label={title} lazy />
      <div className="card-body">
        <Heading>{url ? <ExternalLink className="card-link" label={title} href={url} arrow={false} /> : title}</Heading>
        <p>{description}</p>
        {links.length > 0 && (
          <div className="links">
            {links.map((link, i) => (
              <ExternalLink key={i} {...link} />
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
