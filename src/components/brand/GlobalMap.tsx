import { animate, createMotionPath, stagger, svg, utils } from 'animejs'
import { useMemo } from 'react'
import { WORLD_DOTS, WORLD_HEIGHT, WORLD_WIDTH } from '../../content/worldDots.generated'
import { useAnimeOnView } from '../../lib/anime'
import { cn } from '../../lib/cn'
import type { MissionRegion } from '../../types'

interface GlobalMapProps {
  className?: string
  dotColor?: string
  accent?: string
  /** Confirmed regions with a map position. Unconfirmed/empty → no markers. */
  regions?: MissionRegion[]
  /** Number of decorative twinkling lights (illustrative, not locations). */
  lights?: number
  /**
   * Draw animated arcs between the decorative lights (anime.js) — an
   * illustration of believers being connected across the world.
   */
  connect?: boolean
  label?: string
  /** Hide from assistive technology when purely decorative. */
  decorative?: boolean
}

const points = WORLD_DOTS.split(' ').map((p) => p.split(',').map(Number) as [number, number])
const DOT_PATH = points.map(([x, y]) => `M${x} ${y}h0`).join('')

/** Deterministic pseudo-random so lights don't jump between renders. */
function seeded(n: number, seed = 1337) {
  let s = seed
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647
    out.push(s / 2147483647)
  }
  return out
}

/**
 * Dotted world map (generated at build time — see scripts/generate-world-map.mjs).
 * Decorative lights and arcs are purely illustrative; real locations come only from `regions`.
 */
export function GlobalMap({
  className,
  dotColor = 'currentColor',
  accent = 'var(--color-coral-400)',
  regions = [],
  lights = 14,
  connect = false,
  label = 'Dotted map of the world',
  decorative = false,
}: GlobalMapProps) {
  const lightPoints = useMemo(() => {
    const r = seeded(lights)
    return r.map((v, i) => ({ p: points[Math.floor(v * points.length)], delay: (i * 0.37) % 4 }))
  }, [lights])

  const arcs = useMemo(() => {
    if (!connect) return []
    const out: string[] = []
    for (let i = 0; i < lightPoints.length - 1 && out.length < 7; i++) {
      const [x1, y1] = lightPoints[i].p
      const [x2, y2] = lightPoints[i + 1].p
      const dist = Math.hypot(x2 - x1, y2 - y1)
      if (dist < 12 || dist > 48) continue
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2 - dist * 0.32
      out.push(`M${x1} ${y1}Q${mx.toFixed(2)} ${my.toFixed(2)} ${x2} ${y2}`)
    }
    return out
  }, [connect, lightPoints])

  const ref = useAnimeOnView<SVGSVGElement>(
    (root) => {
      if (!connect) return
      const lightEls = root.querySelectorAll('[data-light]')
      const arcEls = root.querySelectorAll<SVGPathElement>('[data-arc]')
      const comets = root.querySelectorAll('[data-comet]')
      utils.set(lightEls, { scale: 0 })

      animate(lightEls, { scale: [0, 1], duration: 900, delay: stagger(60, { from: 'random' }), ease: 'outBack(2)' })
      animate(svg.createDrawable(arcEls), { draw: ['0 0', '0 1'], duration: 1600, delay: stagger(260, { start: 500 }), ease: 'inOut(3)' })

      comets.forEach((comet, i) => {
        const path = arcEls[i]
        if (!path) return
        animate(comet, {
          ...createMotionPath(path),
          opacity: [0, 1, 1, 0],
          duration: 3200,
          delay: 2200 + i * 420,
          loopDelay: 2600 + i * 180,
          loop: true,
          ease: 'inOut(2)',
        })
      })
    },
    { threshold: 0.2 },
  )

  const positioned = regions.filter((r) => r.position)

  return (
    <svg
      ref={ref}
      viewBox={`-1 -1 ${WORLD_WIDTH + 2} ${WORLD_HEIGHT + 2}`}
      className={cn('h-auto w-full', className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      <path d={DOT_PATH} stroke={dotColor} strokeWidth={0.52} strokeLinecap="round" fill="none" />
      {connect ? (
        <g aria-hidden="true" fill="none" stroke={accent} strokeWidth={0.22} strokeLinecap="round" opacity={0.85}>
          {arcs.map((d) => (
            <path key={d} d={d} data-arc />
          ))}
        </g>
      ) : null}
      <g aria-hidden="true">
        {lightPoints.map(({ p, delay }, i) => (
          <g key={i} data-light style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle
              cx={p[0]}
              cy={p[1]}
              r={0.4}
              fill={accent}
              className="motion-safe:animate-twinkle"
              style={{ animationDelay: `${delay}s`, transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          </g>
        ))}
      </g>
      {connect ? (
        <g aria-hidden="true">
          {arcs.map((d) => (
            <circle key={d} data-comet r={0.55} cx={0} cy={0} fill="var(--color-cream-100)" opacity={0} />
          ))}
        </g>
      ) : null}
      {positioned.map((r) => {
        const x = (r.position!.x / 100) * WORLD_WIDTH
        const y = (r.position!.y / 100) * WORLD_HEIGHT
        return (
          <g key={r.id}>
            <circle cx={x} cy={y} r={1.6} fill={accent} opacity={0.25} />
            <circle cx={x} cy={y} r={0.8} fill={accent}>
              <title>{r.name}</title>
            </circle>
          </g>
        )
      })}
    </svg>
  )
}
