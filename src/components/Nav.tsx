import { motion } from 'motion/react'
import { useContent } from '../content'

const routes = ['', 'projects', 'about', 'socials', 'contact'] as const

export default function Nav({ route }: { route: string }) {
  const { profile, pages } = useContent()

  return (
    <header className="nav">
      <a href="#/" className="brand">
        {profile.name}
        <span className="dot" aria-hidden="true" />
      </a>
      <nav>
        {routes.map((path) => (
          <a key={path} href={`#/${path}`} aria-current={route === path ? 'page' : undefined}>
            {route === path && <motion.span className="pill" layoutId="nav-pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
            <span>{pages[path || 'home'].title}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}
