import { motion } from 'motion/react'
import { useContent } from '../content'

const links = ['', 'projects', 'about', 'socials']

export default function Nav({ route }: { route: string }) {
  const { profile } = useContent()

  return (
    <header className="nav">
      <a href="#/" className="brand" aria-label={`${profile.name}, home`}>
        {profile.name.toLowerCase()}@dev<span className="dim">:~$</span>
        <span className="caret" />
      </a>
      <nav>
        {links.map((path) => (
          <a key={path} href={`#/${path}`} aria-current={route === path ? 'page' : undefined}>
            <span aria-hidden="true">./</span>
            {path || 'home'}
            {route === path && <motion.span className="nav-underline" layoutId="nav-underline" />}
          </a>
        ))}
      </nav>
    </header>
  )
}
