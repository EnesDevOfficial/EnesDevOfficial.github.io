import { motion } from 'motion/react'
import { titles, useContent } from '../content'

export default function Nav({ route }: { route: string }) {
  const { profile } = useContent()

  return (
    <header className="nav">
      <a href="#/" className="brand">
        {profile.name}
        <span className="dot" aria-hidden="true" />
      </a>
      <nav>
        {Object.entries(titles).map(([path, label]) => (
          <a key={path} href={`#/${path}`} aria-current={route === path ? 'page' : undefined}>
            {route === path && <motion.span className="pill" layoutId="nav-pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}
