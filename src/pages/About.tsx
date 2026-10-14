import { motion } from 'motion/react'
import Scramble from '../components/Scramble'
import Tags from '../components/Tags'
import { useContent } from '../content'

const hash = (text: string) => ([...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0).toString(16).padStart(8, '0').slice(0, 7)

export default function About() {
  const { about, timeline, skills } = useContent()

  return (
    <>
      <section className="content">
        <p className="prompt">about.md</p>
        <h1>
          <Scramble text="About" />
        </h1>
        <div className="prose">
          {about.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="content">
        <p className="prompt">timeline.log</p>
        <h2>How I got here</h2>
        <ol className="timeline">
          {timeline.map(({ year, title, text }, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span className="commit">
                commit {hash(title)}
                {year && <span className="dim"> · {year}</span>}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.li>
          ))}
        </ol>
      </section>
      <section className="content">
        <p className="prompt">tools.json</p>
        <h2>Tools</h2>
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
