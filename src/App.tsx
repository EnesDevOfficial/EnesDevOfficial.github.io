import { ReactLenis, useLenis } from 'lenis/react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useSyncExternalStore } from 'react'
import Nav from './components/Nav'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Socials from './pages/Socials'
import { assetUrl, titles, useContent } from './content'

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
  const { profile } = useContent()
  const lenis = useLenis()
  const reduceMotion = useReducedMotion()
  const main = useRef<HTMLElement>(null)
  const lastRoute = useRef(route)

  useEffect(() => {
    document.title = `${route === 'admin' ? 'Control Panel' : titles[route]} | ${profile.name}Dev`
  }, [route, profile.name])

  useEffect(() => {
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href = assetUrl(profile.favicon || 'favicon.svg')
  }, [profile.favicon])

  useEffect(() => {
    if (lastRoute.current === route) return
    lastRoute.current = route
    main.current?.focus({ preventScroll: true })
  }, [route])

  return (
    <MotionConfig reducedMotion="user">
      {!reduceMotion && <ReactLenis root options={{ lerp: 0.1 }} />}
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
        <AnimatePresence mode="wait" onExitComplete={() => (lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0))}>
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Suspense fallback={<p className="content loading">Loading</p>}>{pages[route]}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </MotionConfig>
  )
}
