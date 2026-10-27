import { useContent } from '../content'

export default function About() {
  const { about, skills, pages } = useContent()
  const copy = pages.about

  return (
    <>
      <section className="content">
        {copy.heading && <h1>{copy.heading}</h1>}
        <div className="prose">
          {about.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="content">
        {copy.skillsHeading && <h2>{copy.skillsHeading}</h2>}
        <dl className="skills">
          {skills.map(({ area, items }, i) => (
            <div key={i}>
              <dt>{area}</dt>
              <dd>{items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}
