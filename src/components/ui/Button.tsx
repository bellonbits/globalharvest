import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../brand/Icon'

type Variant = 'primary' | 'secondary' | 'dark' | 'light' | 'outline-light' | 'link' | 'link-light'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group/btn relative inline-flex items-center justify-center gap-2.5 font-display font-semibold uppercase tracking-[0.14em] transition-[background-color,color,box-shadow,transform,border-color] duration-300 ease-(--ease-out-soft) disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px'

const variants: Record<Variant, string> = {
  // Coral with deep-teal text keeps the brand vibrancy and meets WCAG AA (≈6.7:1).
  primary: 'rounded-full bg-coral-400 text-teal-950 shadow-[0_10px_30px_-12px_rgb(242_138_104/0.8)] hover:bg-coral-300 hover:shadow-[0_14px_34px_-12px_rgb(242_138_104/0.9)]',
  secondary: 'rounded-full border border-teal-800/25 text-teal-800 hover:border-teal-800 hover:bg-teal-800 hover:text-cream-100',
  dark: 'rounded-full bg-teal-800 text-cream-100 hover:bg-teal-700',
  light: 'rounded-full bg-cream-100 text-teal-800 hover:bg-white',
  'outline-light': 'rounded-full border border-cream-100/40 text-cream-100 hover:border-cream-100 hover:bg-cream-100 hover:text-teal-800',
  link: 'text-teal-800 hover:text-coral-700 underline-offset-8 decoration-coral-400 decoration-2 hover:underline',
  'link-light': 'text-cream-100 hover:text-coral-200 underline-offset-8 decoration-coral-300 decoration-2 hover:underline',
}

const sizes: Record<Size, string> = {
  sm: 'text-[0.7rem] px-4 py-2.5',
  md: 'text-[0.75rem] px-6 py-3.5',
  lg: 'text-[0.8rem] px-8 py-4.5',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  icon?: IconName | null
  iconLeft?: IconName
  children: ReactNode
  className?: string
}

type ButtonAsLink = CommonProps & { to: string } & Omit<ComponentProps<typeof Link>, 'to' | 'className' | 'children'>
type ButtonAsAnchor = CommonProps & { href: string } & Omit<ComponentProps<'a'>, 'className' | 'children'>
type ButtonAsButton = CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>

export type CTAButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton

/** Primary call-to-action. Renders a router Link, an anchor, or a button. */
export function CTAButton(props: CTAButtonProps) {
  const { variant = 'primary', size = 'md', icon = 'arrowRight', iconLeft, children, className, ...rest } = props
  const isLink = variant === 'link' || variant === 'link-light'
  const classes = cn(base, variants[variant], !isLink && sizes[size], isLink && 'text-[0.75rem] py-1', className)
  const content = (
    <>
      {iconLeft ? <Icon name={iconLeft} size={16} strokeWidth={2} /> : null}
      <span>{children}</span>
      {icon ? (
        <Icon
          name={icon}
          size={16}
          strokeWidth={2}
          className="transition-transform duration-300 ease-(--ease-out-soft) group-hover/btn:translate-x-1"
        />
      ) : null}
    </>
  )

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as ButtonAsLink
    return (
      <Link to={to} className={classes} {...(linkRest as object)}>
        {content}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as ComponentProps<'a'>)}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={classes} {...(rest as ComponentProps<'button'>)}>
      {content}
    </button>
  )
}
