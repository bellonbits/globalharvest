import { m, useScroll, useSpring } from 'framer-motion'
import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
  return null
}

/** Framer Motion: thin coral reading-progress line along the top of the viewport. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  return <m.div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-coral-400 print:hidden" style={{ scaleX }} />
}

function PageFallback() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-teal-800" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <span aria-hidden="true" className="size-10 animate-spin rounded-full border-2 border-cream-100/20 border-t-coral-400" />
    </div>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  // Move focus to the main landmark on client-side navigation so screen-reader users hear the new page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a href="#main" className="sr-only-focusable top-3 left-3 z-[100] rounded-full bg-coral-400 px-5 py-3 font-display font-semibold text-teal-950 shadow-lift">
        Skip to content
      </a>
      <ScrollManager />
      <ScrollProgress />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<PageFallback />}>
          {/* Framer Motion page transition: each route fades up as it arrives. */}
          <m.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
          </m.div>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
