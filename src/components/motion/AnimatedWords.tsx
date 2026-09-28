import { animate, splitText, stagger, utils } from 'animejs'
import { createElement, type ReactNode } from 'react'
import { useAnimeOnView } from '../../lib/anime'

interface AnimatedWordsProps {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  className?: string
  id?: string
  children: ReactNode
  delay?: number
  /** Start on mount rather than when scrolled into view. */
  immediate?: boolean
}

/**
 * Headline that rises into place word by word from behind a clipping mask
 * (anime.js splitText). Screen readers get the original text; the split is
 * reverted on unmount so React's DOM is untouched.
 */
export function AnimatedWords({ as = 'h2', className, id, children, delay = 0, immediate = false }: AnimatedWordsProps) {
  const ref = useAnimeOnView<HTMLElement>(
    (root) => {
      const split = splitText(root, { words: { wrap: 'clip' }, accessible: true })
      utils.set(split.words, { translateY: '110%' })
      animate(split.words, {
        translateY: ['110%', '0%'],
        rotate: [4, 0],
        duration: 1100,
        delay: stagger(70, { start: delay }),
        ease: 'out(4)',
      })
      return () => split.revert()
    },
    { immediate, threshold: 0.2 },
  )
  return createElement(as, { ref, className, id }, children)
}
