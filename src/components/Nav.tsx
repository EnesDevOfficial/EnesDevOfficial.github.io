import { assetUrl, useContent } from '../content'

const routes = ['projects', 'about', 'socials', 'contact'] as const

const brand = (name: string) => name.match(/^(.+?)([A-Z][a-z]*)$/)?.slice(1) ?? [name, '']

export default function Nav({ route }: { route: string }) {
  const { site, profile, pages } = useContent()
  const [first, last] = brand(site.name)
  const toTop = (path: string) => () => {
    if (path === route) scrollTo(0, 0)
  }

  return (
    <header className="nav">
      <a href="#/" className="brand" aria-current={route === '' ? 'page' : undefined} onClick={toTop('')}>
        {profile.favicon && <img src={assetUrl(profile.favicon)} alt="" width="28" height="28" />}
        <span>
          {first}
          <span>{last}</span>
        </span>
      </a>
      <nav>
        {routes.map((path) => (
          <a key={path} href={`#/${path}`} aria-current={route === path ? 'page' : undefined} onClick={toTop(path)}>
            {pages[path].title}
          </a>
        ))}
      </nav>
    </header>
  )
}
