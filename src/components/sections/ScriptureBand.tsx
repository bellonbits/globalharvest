import { cn } from '../../lib/cn'
import { Reveal } from '../ui/Reveal'

/** A single, restrained Scripture moment. Use sparingly. */
export function ScriptureBand({ text, reference, className }: { text: string; reference: string; className?: string }) {
  return (
    <section className={cn('bg-cream-200/60', className)}>
      <Reveal className="container-page py-20 text-center sm:py-28">
        <figure className="mx-auto max-w-4xl">
          <blockquote className="font-display text-[clamp(1.6rem,3.6vw,2.75rem)] leading-[1.2] font-medium tracking-tight text-teal-800">
            <p>“{text}”</p>
          </blockquote>
          <figcaption className="eyebrow mt-8 text-coral-700">{reference}</figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
