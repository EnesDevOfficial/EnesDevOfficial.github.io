import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { lazy, Suspense, useRef, type ReactNode } from 'react'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import Tags from '../components/Tags'
import Title from '../components/Title'
import { useContent } from '../content'

const ParticleScene = lazy(() => import('../components/ParticleScene'))

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
  const { profile, projects, skills, pages } = useContent()
  const text = pages.home
  const story = useRef<HTMLDivElement>(null)
  const active = useInView(story)
  const { scrollYProgress } = useScroll({ target: story, offset: ['start start', 'end end'] })
  const hint = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  return (
    <>
      <div ref={story} className="story">
        <div className="stage">
          <Suspense fallback={null}>
            <ParticleScene progress={scrollYProgress} active={active} />
          </Suspense>
          <Chapter progress={scrollYProgress} range={[0, 0.12, 0.2]}>
            <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {profile.tagline}
            </motion.p>
            <h1 className="mega">
              <Reveal text={profile.headline} delay={0.3} />
            </h1>
            <motion.div className="actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
              {text.primaryButton && (
                <a className="button primary" href="#/projects">
                  {text.primaryButton}
                </a>
              )}
              {text.secondaryButton && (
                <a className="button" href="#/contact">
                  {text.secondaryButton}
                </a>
              )}
            </motion.div>
          </Chapter>
          <Chapter progress={scrollYProgress} range={[0.24, 0.32, 0.44, 0.52]}>
            {text.storyLabel && <p className="eyebrow">{text.storyLabel}</p>}
            <p className="statement">{profile.story}</p>
          </Chapter>
          <Chapter progress={scrollYProgress} range={[0.6, 0.7, 0.92, 1]}>
            {text.toolsLabel && <p className="eyebrow">{text.toolsLabel}</p>}
            <Tags items={[...new Set(skills.flatMap((group) => group.items))]} className="chips" />
          </Chapter>
          <motion.p className="hint" style={{ opacity: hint }} aria-hidden="true">
            {text.scrollHint}
          </motion.p>
        </div>
      </div>
      <section className="content">
        <Title eyebrow={text.featuredLabel} text={text.featuredTitle} />
        <div className="grid">
          {projects
            .filter((project) => project.featured)
            .map((project, i) => (
              <ProjectCard key={i} {...project} index={i} />
            ))}
        </div>
        <div className="actions">
          {text.allProjectsButton && (
            <a className="button primary" href="#/projects">
              {text.allProjectsButton}
            </a>
          )}
          {text.aboutButton && (
            <a className="button" href="#/about">
              {text.aboutButton}
            </a>
          )}
        </div>
      </section>
    </>
  )
}
