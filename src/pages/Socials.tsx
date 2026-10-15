import { motion } from 'motion/react'
import Backdrop from '../components/Backdrop'
import ExternalLink from '../components/ExternalLink'
import PlatformIcon from '../components/PlatformIcon'
import Reveal from '../components/Reveal'
import Thumb from '../components/Thumb'
import { useContent } from '../content'
import { platform } from '../platforms'

const shortUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function Socials() {
  const { profile, socials } = useContent()

  return (
    <section className="content socials">
      <div className="avatar-wrap">
        <Backdrop field="orbits" />
        <motion.div className="ring" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}>
          <Thumb className="avatar" src={profile.avatar} label={profile.name} />
        </motion.div>
      </div>
      <h1>
        <Reveal text={profile.name} delay={0.1} />
      </h1>
      <p className="lead">{profile.tagline}</p>
      {profile.handle && <p className="handle">{profile.handle}</p>}
      <ul className="link-list">
        {socials.map((link, i) => {
          const { path, mail, style } = platform(`${link.label} ${link.href}`)
          return (
            <motion.li key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.5 }}>
              <ExternalLink className="social" style={style} {...link}>
                <PlatformIcon path={path} mail={mail} />
                <span className="social-text">
                  <strong>{link.label}</strong>
                  <span className="url">{shortUrl(link.href)}</span>
                </span>
              </ExternalLink>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
