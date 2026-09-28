import type { Testimonial } from '../../types'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'

export function TestimonialCard({ testimonial, featured, className }: { testimonial: Testimonial; featured?: boolean; className?: string }) {
  return (
    <figure
      className={cn(
        'relative flex h-full flex-col rounded-[1.75rem] p-8 sm:p-10',
        featured ? 'bg-teal-800 text-cream-100' : 'bg-cream-50 text-teal-900 ring-1 ring-teal-800/10',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <Icon name="quote" size={40} strokeWidth={1.2} className={featured ? 'text-coral-300' : 'text-coral-500'} />
        {testimonial.isPlaceholder ? <PlaceholderBadge label="Placeholder testimonial" tone={featured ? 'light' : 'dark'} /> : null}
      </div>
      <blockquote className={cn('mt-6 font-display leading-snug', featured ? 'text-2xl sm:text-[1.85rem]' : 'text-xl')}>
        <p className={testimonial.isPlaceholder ? 'italic opacity-80' : undefined}>“{testimonial.quote}”</p>
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-4 pt-8">
        <span aria-hidden="true" className={cn('grid size-12 place-items-center rounded-full border border-dashed', featured ? 'border-cream-100/40 text-cream-100/60' : 'border-teal-800/30 text-teal-800/50')}>
          <Icon name="user" size={20} />
        </span>
        <span>
          <span className="block font-display font-semibold">{testimonial.name}</span>
          <span className={cn('block text-sm', featured ? 'text-cream-100/65' : 'text-teal-900/60')}>{testimonial.context}</span>
        </span>
      </figcaption>
    </figure>
  )
}
