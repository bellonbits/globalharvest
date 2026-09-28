import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { AnimatedWords } from '../motion/AnimatedWords'
import { Reveal } from './Reveal'

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  as?: 'h1' | 'h2' | 'h3'
  size?: 'md' | 'lg'
  className?: string
  id?: string
  children?: ReactNode
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  as: Heading = 'h2',
  size = 'md',
  className,
  id,
  children,
}: SectionHeaderProps) {
  const light = tone === 'light'
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p className={cn('eyebrow mb-5 flex items-center gap-3', align === 'center' && 'justify-center', light ? 'text-coral-300' : 'text-coral-700')}>
          <span aria-hidden="true" className={cn('h-px w-8', light ? 'bg-coral-300/70' : 'bg-coral-600/60')} />
          {eyebrow}
        </p>
      ) : null}
      <AnimatedWords as={Heading} id={id} className={cn(size === 'lg' ? 'display-lg' : 'display-md', light ? 'text-cream-100' : 'text-teal-800')}>
        {title}
      </AnimatedWords>
      {description ? (
        <div className={cn('mt-6 text-lg leading-relaxed', light ? 'text-cream-100/80' : 'text-teal-900/75')}>{description}</div>
      ) : null}
      {children}
    </Reveal>
  )
}
