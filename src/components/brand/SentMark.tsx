import { createTimeline, stagger, utils } from 'animejs'
import { cn } from '../../lib/cn'
import { useAnimeOnView } from '../../lib/anime'
import { WhaleShape, type WhaleColors } from './Whale'

interface SentMarkProps {
  /** Colour of the SENT letters. */
  letters?: string
  whale?: WhaleColors
  /** Background colour behind the mark — used to cut a clean outline around the whale. */
  background?: string
  /** Gently float the whale. Disabled automatically for reduced-motion users. */
  animated?: boolean
  /**
   * Play the anime.js intro when the mark enters the viewport: letters rise one
   * by one, the whale swims in from the deep and a ripple spreads from its path.
   */
  intro?: boolean
  /** Start the intro immediately (above-the-fold usage). */
  introImmediate?: boolean
  introDelay?: number
  className?: string
  title?: string
}

/** Each letter is its own <text> so it can be choreographed; widths keep the lockup identical to the brand mark. */
const LETTERS = [
  { ch: 'S', x: 20, w: 218 },
  { ch: 'E', x: 258, w: 204 },
  { ch: 'N', x: 484, w: 268 },
  { ch: 'T', x: 772, w: 208 },
]

/**
 * The SENT mark: heavy display lettering with the humpback swimming through it.
 * Built as a single SVG so the composition scales identically everywhere —
 * website hero, posters and social cards.
 */
export function SentMark({
  letters = 'var(--color-coral-400)',
  whale,
  background = 'var(--color-cream-100)',
  animated = false,
  intro = false,
  introImmediate = false,
  introDelay = 0,
  className,
  title = 'SENT',
}: SentMarkProps) {
  const ref = useAnimeOnView<SVGSVGElement>(
    (root) => {
      if (!intro) return
      const letterEls = root.querySelectorAll('[data-letter]')
      const swim = root.querySelectorAll('[data-swim]')
      const ripples = root.querySelectorAll('[data-ripple]')
      utils.set(letterEls, { opacity: 0, translateY: 140, rotate: () => utils.random(-8, 8) })
      utils.set(swim, { opacity: 0, translateX: -420, translateY: 160, rotate: 14 })
      utils.set(ripples, { opacity: 0, scale: 0.2 })

      createTimeline({ delay: introDelay, defaults: { ease: 'out(4)' } })
        .add(letterEls, { opacity: [0, 1], translateY: [140, 0], rotate: 0, duration: 1100, delay: stagger(110) })
        .add(swim, { opacity: [0, 1], translateX: [-420, 0], translateY: [160, 0], rotate: [14, 0], duration: 1700, ease: 'out(3)' }, '-=900')
        .add(ripples, { opacity: [0.7, 0], scale: [0.2, 2.4], duration: 1600, delay: stagger(220), ease: 'out(2)' }, '-=700')
    },
    { immediate: introImmediate, threshold: 0.3 },
  )

  return (
    <svg ref={ref} viewBox="0 0 1000 600" className={cn('h-auto w-full overflow-visible', className)} role="img" aria-label={title} focusable="false">
      <g aria-hidden="true" fill={letters} style={{ font: '800 400px var(--font-display)' }}>
        {LETTERS.map((l) => (
          <text key={l.ch} data-letter x={l.x} y={392} textLength={l.w} lengthAdjust="spacingAndGlyphs" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
            {l.ch}
          </text>
        ))}
      </g>
      {intro ? (
        <g aria-hidden="true" fill="none" stroke={letters} strokeWidth={3}>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} data-ripple cx={200} cy={440} rx={120} ry={30} opacity={0} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          ))}
        </g>
      ) : null}
      {/* Position on the outer group; animate inner groups so transforms never override placement. */}
      <g transform="translate(36 150) scale(1.42)">
        <g data-swim style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <g className={animated ? 'motion-safe:animate-drift' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <WhaleShape halo={background} haloWidth={9} {...whale} />
          </g>
        </g>
      </g>
    </svg>
  )
}
