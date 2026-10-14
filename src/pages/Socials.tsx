import { motion } from 'motion/react'
import ExternalLink from '../components/ExternalLink'
import Reveal from '../components/Reveal'
import Thumb from '../components/Thumb'
import { useContent } from '../content'

const shortUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function Socials() {
  const { profile, socials } = useContent()

  return (
    <section className="content socials">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}>
        <Thumb className="avatar" src={profile.avatar} label={profile.name} />
      </motion.div>
      <h1>
        <Reveal text={profile.name} delay={0.1} />
      </h1>
      <p className="lead">{profile.tagline}</p>
      <p className="dim">{profile.handle}</p>
      <ul>
        {socials.map((link, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.5 }}>
            <ExternalLink className="social" {...link}>
              <strong>{link.label}</strong>
              <span className="url">{shortUrl(link.href)}</span>
            </ExternalLink>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
