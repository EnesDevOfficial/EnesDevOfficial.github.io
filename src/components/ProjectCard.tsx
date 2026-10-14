import { motion } from 'motion/react'
import type { Ref } from 'react'
import type { Project } from '../content'
import ExternalLink from './ExternalLink'
import Tags from './Tags'
import Thumb from './Thumb'

type Props = Project & { index: number; heading?: 'h2' | 'h3'; ref?: Ref<HTMLElement> }

export default function ProjectCard({ title, description, category, tags, links, image, index, heading: Heading = 'h3', ref }: Props) {
  return (
    <motion.article
      ref={ref}
      className="card"
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: [0.2, 0.7, 0.2, 1], layout: { delay: 0 } }}
    >
      <div className="card-head" aria-hidden="true">
        <span>[{String(index + 1).padStart(2, '0')}]</span>
        <span>{category.toLowerCase()}</span>
      </div>
      <Thumb className="thumb" src={image} label={title} lazy />
      <div className="card-body">
        <Heading>{title}</Heading>
        <p>{description}</p>
        <Tags items={tags} />
        <div className="links">
          {links.map((link, i) => (
            <ExternalLink key={i} {...link} />
          ))}
        </div>
      </div>
    </motion.article>
  )
}
