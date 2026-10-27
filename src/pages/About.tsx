import Tags from '../components/Tags'
import Title from '../components/Title'
import { useContent } from '../content'

export default function About() {
  const { about, skills, pages } = useContent()
  const copy = pages.about

  return (
    <>
      <section className="content">
        <Title eyebrow={copy.label} text={copy.heading} as="h1" />
        <div className="prose">
          {about.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="content">
        <Title eyebrow={copy.skillsLabel} text={copy.skillsHeading} />
        <div className="skills">
          {skills.map(({ area, items }, i) => (
            <div key={i} className="panel">
              <h3>{area}</h3>
              <Tags items={items} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
