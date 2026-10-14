import ProjectCard from '../components/ProjectCard'
import Title from '../components/Title'
import { useContent } from '../content'

export default function Projects() {
  const { projects, pages } = useContent()

  return (
    <section className="content">
      <Title eyebrow={pages.projects.label} text={pages.projects.heading} as="h1" />
      <div className="grid">
        {projects.map((project, i) => (
          <ProjectCard key={i} {...project} index={i} heading="h2" />
        ))}
      </div>
    </section>
  )
}
