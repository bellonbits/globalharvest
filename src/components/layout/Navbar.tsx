import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { primaryNav } from '../../config/site'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { Logo } from '../brand/Logo'
import { CTAButton } from '../ui/Button'
import { MobileMenu } from './MobileMenu'

/** Routes whose top area is light, so the header must be solid from the first frame. */
const LIGHT_TOP_ROUTES = ['/register']

/**
 * Site header.
 * - Over a page's dark hero: transparent bar with light text.
 * - After scrolling (or on light-topped pages): a floating frosted-glass pill.
 * - Slides away while scrolling down, returns on scroll up.
 * - The active link carries a Framer Motion highlight that glides between items.
 */
export function Navbar() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    // Hide after the hero area when scrolling down; always show when scrolling up.
    setHidden(!reduce && y > 480 && y > prev + 4)
    if (y < prev - 4) setHidden(false)
  })

  useEffect(() => {
    setMenuOpen(false)
    setHidden(false)
    setScrolled(window.scrollY > 24)
  }, [pathname])

  const solid = scrolled || LIGHT_TOP_ROUTES.includes(pathname)
  const desktopNav = primaryNav.filter((i) => i.to !== '/')
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`)
  const highlight = hovered ?? desktopNav.find((i) => isActive(i.to))?.to ?? null

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50 print:hidden"
        initial={false}
        animate={{ y: hidden && !menuOpen ? '-120%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={cn('transition-[padding] duration-500 ease-(--ease-out-soft)', solid ? 'px-3 pt-3 sm:px-5' : 'px-0 pt-0')}>
          <div
            className={cn(
              'mx-auto flex items-center justify-between gap-6 transition-[max-width,height,background-color,border-radius,box-shadow,padding] duration-500 ease-(--ease-out-soft)',
              solid
                ? 'h-16 max-w-[1240px] rounded-full bg-cream-50/85 pr-2.5 pl-6 text-teal-800 shadow-[0_12px_40px_-16px_rgb(6_52_61/0.35)] ring-1 ring-teal-800/10 backdrop-blur-xl backdrop-saturate-150 sm:pl-8'
                : 'on-dark h-22 max-w-[1320px] bg-transparent px-5 text-cream-100 sm:px-8 lg:px-12',
            )}
          >
            <Logo tone={solid ? 'dark' : 'light'} size={solid ? 'sm' : 'md'} />

            <nav aria-label="Primary" className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
              <ul className="flex items-center">
                {desktopNav.map((item) => {
                  const active = isActive(item.to)
                  return (
                    <li key={item.to} className="relative">
                      {highlight === item.to ? (
                        <m.span
                          layoutId="nav-highlight"
                          aria-hidden="true"
                          className={cn('absolute inset-0 rounded-full', solid ? 'bg-teal-800/[0.07]' : 'bg-cream-100/12')}
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      ) : null}
                      <NavLink
                        to={item.to}
                        onMouseEnter={() => setHovered(item.to)}
                        onFocus={() => setHovered(item.to)}
                        onBlur={() => setHovered(null)}
                        className={cn(
                          'relative block rounded-full px-3.5 py-2 font-display text-[0.9rem] font-medium whitespace-nowrap transition-colors xl:px-4',
                          solid ? (active ? 'text-coral-700' : 'text-teal-800') : active ? 'text-coral-200' : 'text-cream-100/90 hover:text-cream-100',
                        )}
                      >
                        {item.label}
                        {active ? (
                          <span aria-hidden="true" className={cn('absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full', solid ? 'bg-coral-500' : 'bg-coral-300')} />
                        ) : null}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2.5">
              <CTAButton to="/register" size="sm" className="hidden sm:inline-flex" icon={null}>
                Register
              </CTAButton>
              <button
                type="button"
                className={cn(
                  'grid size-11 place-items-center rounded-full border transition lg:hidden',
                  solid ? 'border-teal-800/15 text-teal-800 hover:bg-teal-800 hover:text-cream-100' : 'border-cream-100/30 text-cream-100 hover:bg-cream-100 hover:text-teal-800',
                )}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="menu" size={22} />
              </button>
            </div>
          </div>
        </div>
      </m.header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
