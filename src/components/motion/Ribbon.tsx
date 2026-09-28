import { animate } from 'animejs'
import { Fragment } from 'react'
import { useAnimeOnView } from '../../lib/anime'
import { cn } from '../../lib/cn'

interface RibbonProps {
  words?: string[]
  tone?: 'coral' | 'teal' | 'cream'
  className?: string
  /** Seconds for one full loop. */
  speed?: number
  reverse?: boolean
}

const tones = {
  coral: 'bg-coral-400 text-teal-900',
  teal: 'bg-teal-800 text-cream-100',
  cream: 'bg-cream-200 text-teal-800',
}

/**
 * Infinite editorial ribbon ("Study · Pray · Share · Go") driven by anime.js.
 * Slows down while hovered; static for reduced-motion users.
 */
export function Ribbon({ words = ['Study', 'Pray', 'Share', 'Go'], tone = 'coral', className, speed = 28, reverse = false }: RibbonProps) {
  const ref = useAnimeOnView<HTMLDivElement>(
    (root) => {
      const track = root.querySelector<HTMLElement>('[data-track]')
      if (!track) return
      const loop = animate(track, {
        translateX: reverse ? ['-50%', '0%'] : ['0%', '-50%'],
        duration: speed * 1000,
        ease: 'linear',
        loop: true,
      })
      const slow = () => (loop.speed = 0.25)
      const normal = () => (loop.speed = 1)
      root.addEventListener('pointerenter', slow)
      root.addEventListener('pointerleave', normal)
      return () => {
        root.removeEventListener('pointerenter', slow)
        root.removeEventListener('pointerleave', normal)
      }
    },
    { threshold: 0 },
  )

  const sequence = Array.from({ length: 4 }, () => words).flat()
  return (
    <div ref={ref} className={cn('overflow-hidden py-5 sm:py-7', tones[tone], className)} aria-label={words.join(', ')} role="img">
      <div data-track className="flex w-max items-center whitespace-nowrap will-change-transform" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {sequence.map((w, i) => (
              <Fragment key={`${copy}-${i}`}>
                <span className={cn('px-6 font-display text-3xl font-bold tracking-tight uppercase sm:px-10 sm:text-5xl', i % 2 === 1 && 'font-script text-4xl font-normal normal-case sm:text-6xl')}>
                  {w}
                </span>
                <svg viewBox="0 0 24 24" className="size-5 shrink-0 opacity-60 sm:size-7" fill="currentColor">
                  <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5Z" />
                </svg>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
