import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import Nav from './components/Nav'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Socials from './pages/Socials'
import { assetUrl, useContent } from './content'

const Admin = lazy(() => import('./admin/Admin'))

const pages = {
  '': <Home />,
  projects: <Projects />,
  about: <About />,
  socials: <Socials />,
  contact: <Contact />,
  admin: <Admin />,
}

const subscribe = (onChange: () => void) => {
  addEventListener('hashchange', onChange)
  return () => removeEventListener('hashchange', onChange)
}

const getRoute = () => {
  const route = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0].toLowerCase()
  return Object.hasOwn(pages, route) ? (route as keyof typeof pages) : ''
}

export default function App() {
  const route = useSyncExternalStore(subscribe, getRoute)
  const { profile, site, pages: copy } = useContent()
  const main = useRef<HTMLElement>(null)
  const lastRoute = useRef(route)

  useEffect(() => {
    document.title = `${route === 'admin' ? 'Control Panel' : copy[route || 'home'].title} | ${site.name}`
  }, [route, copy, site.name])

  useEffect(() => {
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href = assetUrl(profile.favicon || 'favicon.svg')
  }, [profile.favicon])

  useLayoutEffect(() => {
    if (lastRoute.current === route) return
    lastRoute.current = route
    scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [route])

  return (
    <>
      <a
        className="skip sr-only"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          main.current?.focus()
        }}
      >
        Skip to content
      </a>
      <Nav route={route} />
      <main id="main" ref={main} tabIndex={-1}>
        <Suspense fallback={<p className="content loading">Loading</p>}>{pages[route]}</Suspense>
      </main>
    </>
  )
}
