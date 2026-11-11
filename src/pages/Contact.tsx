import CopyButton from '../components/CopyButton'
import ExternalLink from '../components/ExternalLink'
import PlatformIcon from '../components/PlatformIcon'
import { useContent } from '../content'
import { platform } from '../platforms'

export default function Contact() {
  const { contacts, pages } = useContent()
  const text = pages.contact
  return (
    <section className="content contact">
      {text.heading && <h1>{text.heading}</h1>}
      {text.note && <p className="lead">{text.note}</p>}
      {contacts.length ? (
        <ul className="methods">
          {contacts.map(({ label, value, href, copy: copyable }, i) => {
            const { path, mail, style } = platform(`${label} ${value} ${href}`)
            return (
              <li key={i} style={style}>
                <span className="label">
                  <PlatformIcon path={path} mail={mail} />
                  {label}
                </span>
                <strong>{value}</strong>
                {(copyable || href) && (
                  <div className="row">
                    {copyable && <CopyButton value={value} label={text.copyButton} done={text.copiedButton} />}
                    {href && <ExternalLink className="button" label={text.openButton} href={href} />}
                  </div>
                )}
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
