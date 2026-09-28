import { m, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'section' | 'article'
}

/** Fades content up as it enters the viewport. Respects reduced-motion preferences. */
export function Reveal({ children, delay = 0, y = 28, as = 'div', ...rest }: RevealProps) {
  const reduce = useReducedMotion()
  const Component = m[as] as typeof m.div
  return (
    <Component
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** Stagger container + item for lists of cards. */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}
export const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}
