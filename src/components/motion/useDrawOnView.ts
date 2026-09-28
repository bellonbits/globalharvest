import { animate, stagger, svg } from 'animejs'
import { useAnimeOnView } from '../../lib/anime'

/**
 * Draws every stroked SVG shape inside the element (e.g. line icons) as it
 * scrolls into view — like a pen tracing the icon.
 */
export function useDrawOnView<T extends Element>({ delay = 0, duration = 1400 }: { delay?: number; duration?: number } = {}) {
  return useAnimeOnView<T>(
    (root) => {
      const shapes = root.querySelectorAll('svg[data-draw] path, svg[data-draw] circle, svg[data-draw] rect')
      if (!shapes.length) return
      animate(svg.createDrawable(shapes), {
        draw: ['0 0', '0 1'],
        duration,
        delay: stagger(120, { start: delay }),
        ease: 'inOut(3)',
      })
    },
    { threshold: 0.4 },
  )
}
