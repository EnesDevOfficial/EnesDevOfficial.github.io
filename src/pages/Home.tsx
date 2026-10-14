import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { lazy, Suspense, useRef, type ReactNode } from 'react'
import { bootDelay } from '../boot'
import ProjectCard from '../components/ProjectCard'
import Scramble from '../components/Scramble'
import { useContent } from '../content'

const BinaryScene = lazy(() => import('../components/BinaryScene'))

function Chapter({ progress, range, children }: { progress: MotionValue<number>; range: number[]; children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  const opacity = useTransform(progress, range, range.length === 3 ? [1, 1, 0] : [0, 1, 1, 0])
  const y = useTransform(progress, [range[0], range.at(-1)!], [range.length === 3 ? 0 : 60, -60])
  return (
    <motion.div className="chapter" style={{ opacity, y: reduceMotion ? 0 : y }}>
      {children}
    </motion.div>
  )
}

export default function Home() {
  const { profile, projects, skills } = useContent()
  const story = useRef<HTMLDivElement>(null)
  const active = useInView(story)
  const { scrollYProgress } = useScroll({ target: story, offset: ['start start', 'end end'] })
  const hint = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  return (
    <>
      <div ref={story} className="story">
        <div className="stage">
          <Suspense fallback={null}>
            <BinaryScene progress={scrollYProgress} active={active} />
          </Suspense>
          <Chapter progress={scrollYProgress} range={[0, 0.12, 0.2]}>
            <p className="prompt">whoami.txt</p>
            <h1 className="mega">
              <Scramble text={profile.name} charsPerSecond={10} delay={bootDelay} />
            </h1>
            <p className="lead">{profile.tagline}</p>
          </Chapter>
          <Chapter progress={scrollYProgress} range={[0.24, 0.32, 0.44, 0.52]}>
            <p className="prompt">origin.txt</p>
            <p className="big">
              Writing code since <em>age 8</em>.<br />
              Started on Roblox, now shipping apps.
            </p>
          </Chapter>
          <Chapter progress={scrollYProgress} range={[0.6, 0.7, 0.92, 1]}>
            <p className="prompt">tools/</p>
            <ul className="skill-cloud">
              {[...new Set(skills.flatMap((group) => group.items))].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Chapter>
          <motion.p className="hint" style={{ opacity: hint }} aria-hidden="true">
            scroll ↓
          </motion.p>
        </div>
      </div>
      <section className="content">
        <p className="prompt">projects/featured/</p>
        <h2>Featured builds</h2>
        <div className="grid">
          {projects
            .filter((project) => project.featured)
            .map((project, i) => (
              <ProjectCard key={i} {...project} index={i} />
            ))}
        </div>
        <div className="actions">
          <a className="button primary" href="#/projects">
            ./projects →
          </a>
          <a className="button" href="#/socials">
            ./socials
          </a>
        </div>
      </section>
    </>
  )
}
