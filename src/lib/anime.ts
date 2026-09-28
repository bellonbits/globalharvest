/**
 * anime.js helpers.
 *
 * Framer Motion drives layout-level motion (reveals, parallax, page and
 * overlay transitions). anime.js drives the signature, choreographed
 * moments: SVG line drawing, the SENT intro, map connections, split-text
 * headlines, the ribbon marquee and scroll-synced type.
 *
 * Every helper is a no-op for users who prefer reduced motion.
 */
import { createScope, type Scope } from 'animejs'
import { useLayoutEffect, useRef, type RefObject } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Runs an anime.js setup function inside a Scope bound to `root`, once the
 * element enters the viewport. Everything created in the scope is reverted
 * on unmount, so React always gets its original DOM back.
 */
export function useAnimeOnView<T extends Element>(
  setup: (root: T, scope: Scope) => void | (() => void),
  { threshold = 0.25, rootMargin = '0px 0px -8% 0px', immediate = false }: { threshold?: number; rootMargin?: string; immediate?: boolean } = {},
): RefObject<T | null> {
  const ref = useRef<T>(null)
  const setupRef = useRef(setup)
  useLayoutEffect(() => {
    setupRef.current = setup
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let scope: Scope | null = null
    const run = () => {
      scope = createScope({ root: el as unknown as HTMLElement }).add((self) => setupRef.current(el, self!) ?? undefined)
    }
    if (immediate) {
      run()
      return () => scope?.revert()
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          run()
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      scope?.revert()
    }
  }, [threshold, rootMargin, immediate])

  return ref
}
