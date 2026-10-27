import ProjectCard from '../components/ProjectCard'
import { useContent } from '../content'

export default function Projects() {
  const { projects, pages } = useContent()

  return (
    <section className="content">
      {pages.projects.heading && <h1>{pages.projects.heading}</h1>}
      <div className="grid">
        {projects.map((project, i) => (
          <ProjectCard key={i} {...project} heading="h2" />
        ))}
      </div>
    </section>
  )
}
