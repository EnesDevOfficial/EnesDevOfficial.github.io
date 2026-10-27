import { useState } from 'react'
import ExternalLink from '../components/ExternalLink'
import PlatformIcon from '../components/PlatformIcon'
import { useContent } from '../content'
import { platform } from '../platforms'

export default function Contact() {
  const { contacts, pages } = useContent()
  const text = pages.contact
  const [copied, setCopied] = useState(-1)

  const copy = (value: string, i: number) =>
    navigator.clipboard.writeText(value).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(-1), 1500)
    })

  return (
    <section className="content contact">
      {text.heading && <h1>{text.heading}</h1>}
      {text.note && <p className="lead">{text.note}</p>}
      {contacts.length ? (
        <ul className="methods">
          {contacts.map(({ label, value, href }, i) => {
            const { path, mail, style } = platform(`${label} ${value} ${href}`)
            return (
              <li key={i} style={style}>
                <span className="label">
                  <PlatformIcon path={path} mail={mail} />
                  {label}
                </span>
                <strong>{value}</strong>
                <div className="row">
                  <button onClick={() => copy(value, i)} aria-live="polite">
                    {copied === i ? text.copiedButton : text.copyButton}
                  </button>
                  {href && <ExternalLink className="button" label={text.openButton} href={href} />}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="lead">{text.empty}</p>
      )}
    </section>
  )
}
