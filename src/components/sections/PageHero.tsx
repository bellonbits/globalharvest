import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useCmsPage } from '../../hooks/useCmsPage'
import { GlobalMap } from '../brand/GlobalMap'
import { AnimatedWords } from '../motion/AnimatedWords'
import { Img } from '../ui/Img'

interface PageHeroProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  image?: string
  imagePosition?: string
  children?: ReactNode
  /** Content shown to the right on large screens (e.g. an info card). */
  aside?: ReactNode
  size?: 'md' | 'lg'
  showMap?: boolean
  className?: string
  /** CMS page key — a published Hero block overrides eyebrow, title, text and image. */
  cms?: string
}

/**
 * Interior page hero: full-bleed photograph under a deep-ocean gradient,
 * with editorial type. The header sits transparently on top of it.
 */
export function PageHero({ eyebrow: eyebrowProp, title: titleProp, description: descriptionProp, image, imagePosition = 'center', children, aside, size = 'md', showMap, className, cms }: PageHeroProps) {
  const reduce = useReducedMotion()
  const { hero } = useCmsPage(cms)
  const eyebrow = hero?.eyebrow ?? eyebrowProp
  const title = hero?.title ?? titleProp
  const description = hero?.body ?? descriptionProp
  const imageUrl = hero?.imageUrl
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <section className={cn('on-dark relative isolate overflow-hidden bg-teal-800 text-cream-100', className)}>
      {image || imageUrl ? (
        <m.div className="absolute inset-0 -z-20" {...(reduce ? {} : { initial: { scale: 1.08 }, animate: { scale: 1 }, transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } })}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" style={{ objectPosition: imagePosition }} />
          ) : (
            <Img name={image!} priority decorative sizes="100vw" className="size-full object-cover" style={{ objectPosition: imagePosition }} />
          )}
        </m.div>
      ) : null}
      <div
        aria-hidden="true"
        className={cn(
          '-z-10 absolute inset-0',
          image || imageUrl
            ? 'bg-[linear-gradient(180deg,rgb(6_52_61/0.55)_0%,rgb(6_52_61/0.35)_35%,rgb(4_39_46/0.92)_100%),linear-gradient(90deg,rgb(4_39_46/0.75)_0%,rgb(4_39_46/0.1)_75%)]'
            : 'bg-[radial-gradient(ellipse_at_top_right,rgb(242_138_104/0.35),transparent_55%),linear-gradient(180deg,var(--color-teal-700),var(--color-teal-900))]',
        )}
      />
      {showMap ? <GlobalMap decorative lights={10} className="pointer-events-none absolute right-[-10%] bottom-0 -z-10 w-[85%] max-w-none text-cream-100/12 lg:w-[60%]" /> : null}

      <div className={cn('container-page grid items-end gap-12 lg:grid-cols-12', size === 'lg' ? 'pt-44 pb-24 sm:pt-52 lg:min-h-[88vh] lg:pb-28' : 'pt-40 pb-20 sm:pt-48 lg:min-h-[64vh] lg:pb-24')}>
        <div className={cn(aside ? 'lg:col-span-7' : 'lg:col-span-9')}>
          {eyebrow ? (
            <m.p className="eyebrow mb-6 flex items-center gap-3 text-coral-300" {...fade(0.1)}>
              <span aria-hidden="true" className="h-px w-8 bg-coral-300/70" />
              {eyebrow}
            </m.p>
          ) : null}
          <AnimatedWords key={typeof title === 'string' ? title : 'default'} as="h1" immediate delay={200} className="display-xl text-cream-100">
            {title}
          </AnimatedWords>
          {description ? (
            <m.div className="lede mt-7 max-w-2xl text-cream-100/80" {...fade(0.35)}>
              {description}
            </m.div>
          ) : null}
          {children ? (
            <m.div className="mt-10 flex flex-wrap items-center gap-4" {...fade(0.5)}>
              {children}
            </m.div>
          ) : null}
        </div>
        {aside ? (
          <m.div className="lg:col-span-5" {...fade(0.55)}>
            {aside}
          </m.div>
        ) : null}
      </div>
    </section>
  )
}
