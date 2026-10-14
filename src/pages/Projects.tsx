import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import Scramble from '../components/Scramble'
import { categories, useContent, type Category } from '../content'

const filters = ['All', ...categories] as const

export default function Projects() {
  const { projects } = useContent()
  const [filter, setFilter] = useState<Category | 'All'>('All')
  const shown = projects.map((project, id) => ({ ...project, id })).filter((project) => filter === 'All' || project.category === filter)

  return (
    <section className="content">
      <p className="prompt">projects/</p>
      <h1>
        <Scramble text="Projects" />
      </h1>
      <div className="filters" role="group" aria-label="Filter by category">
        {filters.map((category) => (
          <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>
            --{category.toLowerCase()}
          </button>
        ))}
      </div>
      <p className="dim" aria-live="polite">
        {shown.length} result{shown.length === 1 ? '' : 's'}
      </p>
      <div className="grid">
        <AnimatePresence mode="popLayout">
          {shown.map((project, i) => (
            <ProjectCard key={project.id} {...project} index={i} heading="h2" />
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
