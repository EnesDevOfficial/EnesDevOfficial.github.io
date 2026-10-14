import { ReactLenis, useLenis } from 'lenis/react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useSyncExternalStore } from 'react'
import Boot from './components/Boot'
import Nav from './components/Nav'
import About from './pages/About'
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
  admin: <Admin />,
}

const titles = { '': 'Home', projects: 'Projects', about: 'About', socials: 'Socials', admin: 'Control Panel' }

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
  const main = useRef<HTMLElement>(null)
  const lastRoute = useRef(route)

  useEffect(() => {
    document.title = `${titles[route]} | ${profile.name}Dev`
  }, [route, profile.name])

  useEffect(() => {
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href = profile.favicon ? assetUrl(profile.favicon) : `${import.meta.env.BASE_URL}favicon.svg`
  }, [profile.favicon])

  useEffect(() => {
    if (lastRoute.current === route) return
    lastRoute.current = route
    main.current?.focus({ preventScroll: true })
  }, [route])

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.1 }} />
      <Boot />
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
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)', transitionEnd: { clipPath: 'none' } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
          >
            <Suspense fallback={<p className="content prompt">&gt; loading...</p>}>{pages[route]}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </MotionConfig>
  )
}
