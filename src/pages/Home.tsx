import { Component, lazy, Suspense, type ReactNode } from 'react'
import ProjectCard from '../components/ProjectCard'
import { useContent } from '../content'

const ParticleScene = lazy(() => import('../components/ParticleScene'))

class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Home() {
  const { profile, projects, pages } = useContent()
  const text = pages.home

  return (
    <>
      <section className="hero">
        <div className="intro">
          <h1>{profile.headline}</h1>
          {profile.tagline && <p className="tagline">{profile.tagline}</p>}
          {profile.story && <p>{profile.story}</p>}
          {text.primaryButton && (
            <a className="button primary" href="#/projects">
              {text.primaryButton}
            </a>
          )}
        </div>
        {matchMedia('(min-width: 48rem)').matches && (
          <Optional>
            <Suspense fallback={null}>
              <ParticleScene />
            </Suspense>
          </Optional>
        )}
      </section>
      <section className="content">
        <div className="section-head">
          {text.featuredTitle && <h2>{text.featuredTitle}</h2>}
          {text.allProjectsButton && projects.some((project) => !project.featured) && <a href="#/projects">{text.allProjectsButton}</a>}
        </div>
        <div className="grid">
          {projects
            .filter((project) => project.featured)
            .map((project, i) => (
              <ProjectCard key={i} {...project} />
            ))}
        </div>
        {text.contactButton && (
          <a className="button more" href="#/contact">
            {text.contactButton}
          </a>
        )}
      </section>
    </>
  )
}
