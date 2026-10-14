import { motion } from 'motion/react'
import Tags from '../components/Tags'
import Title from '../components/Title'
import { useContent } from '../content'

export default function About() {
  const { about, timeline, skills } = useContent()

  return (
    <>
      <section className="content">
        <Title eyebrow="About" text="About me" as="h1" />
        <div className="prose">
          {about.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="content">
        <Title eyebrow="Journey" text="How I got here" />
        <ol className="timeline">
          {timeline.map(({ year, title, text }, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              {year && <span className="year">{year}</span>}
              <h3>{title}</h3>
              {text && <p>{text}</p>}
            </motion.li>
          ))}
        </ol>
      </section>
      <section className="content">
        <Title eyebrow="Skills" text="Tools I use" />
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
