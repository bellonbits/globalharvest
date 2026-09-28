import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

interface LogoProps {
  tone?: 'dark' | 'light'
  /** Show the "Pray | Study | Share the Gospel" lockup. */
  withTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  asLink?: boolean
}

const sizes = {
  sm: 'text-[0.95rem]',
  md: 'text-[1.15rem]',
  lg: 'text-[1.6rem]',
}

export function Wordmark({ tone = 'dark', size = 'md', withTagline, className }: Omit<LogoProps, 'asLink'>) {
  return (
    <span className={cn('inline-flex items-center gap-4', className)}>
      <span
        className={cn(
          'font-display font-bold uppercase leading-[0.9] tracking-[0.06em]',
          sizes[size],
          tone === 'dark' ? 'text-teal-800' : 'text-cream-100',
        )}
      >
        <span className="block">Global</span>
        <span className="block">Harvest</span>
      </span>
      {withTagline ? (
        <span
          className={cn(
            'hidden border-l pl-4 font-display text-[0.62rem] font-medium uppercase leading-[1.9] tracking-[0.32em] sm:block',
            tone === 'dark' ? 'border-teal-800/25 text-teal-800/80' : 'border-cream-100/35 text-cream-100/85',
          )}
        >
          Pray | Study | Share
          <br />
          the Gospel
        </span>
      ) : null}
    </span>
  )
}

export function Logo({ asLink = true, ...props }: LogoProps) {
  if (!asLink) return <Wordmark {...props} />
  return (
    <Link to="/" aria-label="Global Harvest — home" className="inline-flex rounded-sm">
      <Wordmark {...props} />
    </Link>
  )
}
