import { motion } from 'motion/react'
import ExternalLink from '../components/ExternalLink'
import Scramble from '../components/Scramble'
import Thumb from '../components/Thumb'
import { useContent } from '../content'

const shortUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function Socials() {
  const { profile, socials } = useContent()

  return (
    <section className="content socials">
      <Thumb className="avatar" src={profile.avatar} label={profile.name} />
      <h1>
        <Scramble text={profile.name} />
      </h1>
      <p className="dim">{profile.handle}</p>
      <div className="terminal">
        <p className="prompt">socials/</p>
        <ul>
          {socials.map((link, i) => (
            <motion.li key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
              <ExternalLink className="social" {...link}>
                <strong>{link.label}</strong>
                <span className="dim">{shortUrl(link.href)}</span>
              </ExternalLink>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
