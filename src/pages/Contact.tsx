import { motion } from 'motion/react'
import { useState } from 'react'
import ExternalLink from '../components/ExternalLink'
import Title from '../components/Title'
import { useContent } from '../content'

export default function Contact() {
  const { contacts } = useContent()
  const [copied, setCopied] = useState(-1)

  const copy = (value: string, i: number) =>
    navigator.clipboard.writeText(value).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(-1), 1500)
    })

  return (
    <section className="content contact">
      <Title eyebrow="Contact" text="Get in touch" as="h1" />
      {contacts.length ? (
        <ul>
          {contacts.map(({ label, value, href }, i) => (
            <motion.li key={i} className="panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}>
              <span className="eyebrow">{label}</span>
              <strong>{value}</strong>
              <div className="row">
                <button onClick={() => copy(value, i)} aria-live="polite">
                  {copied === i ? 'Copied' : 'Copy'}
                </button>
                {href && <ExternalLink className="button" label="Open" href={href} />}
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="lead">Contact details are coming soon.</p>
      )}
    </section>
  )
}
