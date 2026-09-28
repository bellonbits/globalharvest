import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { primaryNav, site } from '../../config/site'
import { cn } from '../../lib/cn'
import { GlobalMap } from '../brand/GlobalMap'
import { Icon } from '../brand/Icon'
import { Logo } from '../brand/Logo'
import { CTAButton } from '../ui/Button'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

/** Full-screen mobile navigation with focus trap and Escape to close. */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('button, a')?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button'))
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      opener?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="on-dark fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-teal-800 text-cream-100 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlobalMap className="pointer-events-none absolute -right-1/3 bottom-10 w-[160%] max-w-none text-cream-100/10" lights={8} decorative />
          <div className="container-page relative flex h-22 items-center justify-between">
            <Logo tone="light" />
            <button
              type="button"
              onClick={onClose}
              className="grid size-11 place-items-center rounded-full border border-cream-100/30 transition hover:bg-cream-100 hover:text-teal-800"
              aria-label="Close menu"
            >
              <Icon name="close" size={22} />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-page relative mt-4 flex-1">
            <ul className="space-y-1">
              {primaryNav.map((item, i) => (
                <m.li
                  key={item.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center justify-between border-b border-cream-100/10 py-3.5 font-display text-[1.9rem] font-semibold tracking-tight transition-colors sm:text-4xl',
                        isActive ? 'text-coral-300' : 'text-cream-100 hover:text-coral-200',
                      )
                    }
                  >
                    {item.label}
                    <Icon name="arrowUpRight" size={22} className="opacity-40 transition group-hover:opacity-100" />
                  </NavLink>
                </m.li>
              ))}
            </ul>
          </nav>

          <div className="container-page relative pt-8 pb-10">
            <CTAButton to="/register" size="lg" className="w-full" onClick={onClose}>
              Register
            </CTAButton>
            <p className="eyebrow mt-6 text-center text-cream-100/60">{site.motto}</p>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}
