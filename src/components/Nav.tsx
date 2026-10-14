import { motion } from 'motion/react'
import { useContent } from '../content'

const routes = ['', 'projects', 'about', 'socials', 'contact'] as const

const brand = (name: string) => name.match(/^(.+?)([A-Z][a-z]*)$/)?.slice(1) ?? [name, '']

export default function Nav({ route }: { route: string }) {
  const { site, pages } = useContent()

  return (
    <header className="nav">
      <a href="#/" className="brand">
        {brand(site.name)[0]}
        <span>{brand(site.name)[1]}</span>
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
