import { useState } from 'react'
import ExternalLink from '../components/ExternalLink'
import PlatformIcon from '../components/PlatformIcon'
import Thumb from '../components/Thumb'
import { useContent } from '../content'
import { platform, shortUrl } from '../platforms'

export default function Socials() {
  const { profile, socials, pages } = useContent()
  const [copied, setCopied] = useState(-1)

  const copy = (href: string, i: number) =>
    navigator.clipboard.writeText(href).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(-1), 1500)
    })

  return (
    <section className="content socials">
      <Thumb className="avatar" src={profile.avatar} label={profile.name} />
      <h1>{profile.name}</h1>
      {profile.handle && <p className="handle">{profile.handle}</p>}
      {profile.tagline && <p className="lead">{profile.tagline}</p>}
      <ul className="link-list">
        {socials.map((link, i) => {
          const { path, mail, style } = platform(`${link.label} ${link.href}`)
          return (
            <li key={i}>
              <ExternalLink className="social" style={style} arrow={false} {...link}>
                <PlatformIcon path={path} mail={mail} />
                <span className="social-text">
                  <strong>{link.label}</strong>
                  <span className="url">{shortUrl(link.href)}</span>
                </span>
              </ExternalLink>
              {link.copy && (
                <button className="copy" onClick={() => copy(link.href, i)} aria-live="polite">
                  {copied === i ? pages.socials.copiedButton : pages.socials.copyButton}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
