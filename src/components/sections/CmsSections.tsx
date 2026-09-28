import { Link } from 'react-router-dom'
import { useCmsPage } from '../../hooks/useCmsPage'
import type { CmsBlock } from '../../services/cmsService'
import { Accordion } from '../ui/Accordion'
import { CTAButton } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const s = (v: unknown) => (typeof v === 'string' ? v : '')
const items = (b: CmsBlock) => (Array.isArray(b.fields.items) ? (b.fields.items as Record<string, string>[]) : [])
const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')

function Cta({ label, href, variant = 'primary' }: { label: string; href: string; variant?: 'primary' | 'dark' }) {
  if (!label || !href) return null
  return isInternal(href) ? <CTAButton to={href} variant={variant}>{label}</CTAButton> : <CTAButton href={href} variant={variant} target="_blank" rel="noopener noreferrer">{label}</CTAButton>
}

/**
 * Renders admin-managed content blocks for a page (everything except the hero,
 * which PageHero consumes). All text is rendered as text — never as HTML.
 */
export function CmsSections({ slug }: { slug: string }) {
  const { sections } = useCmsPage(slug)
  if (!sections.length) return null
  return (
    <div className="bg-cream-100">
      {sections.map((b) => {
        switch (b.type) {
          case 'banner':
            return (
              <div key={b.id} className="bg-coral-400 text-teal-950">
                <div className="container-page flex flex-wrap items-center justify-center gap-4 py-4 text-center font-medium">
                  <span>{s(b.fields.body)}</span>
                  {s(b.fields.ctaHref) ? (isInternal(s(b.fields.ctaHref)) ? <Link className="underline underline-offset-4" to={s(b.fields.ctaHref)}>{s(b.fields.ctaLabel) || 'Learn more'}</Link> : <a className="underline underline-offset-4" href={s(b.fields.ctaHref)} rel="noopener noreferrer">{s(b.fields.ctaLabel) || 'Learn more'}</a>) : null}
                </div>
              </div>
            )
          case 'heading':
            return <section key={b.id} className="container-page pt-20"><SectionHeader eyebrow={s(b.fields.eyebrow) || undefined} title={s(b.fields.title)} /></section>
          case 'paragraph':
            return <Reveal key={b.id} className="container-page py-8"><p className="max-w-3xl text-lg leading-relaxed whitespace-pre-line text-teal-900/80">{s(b.fields.body)}</p></Reveal>
          case 'image':
            return s(b.fields.imageUrl) ? (
              <Reveal key={b.id} className="container-page py-10">
                <figure>
                  <img src={s(b.fields.imageUrl)} alt={s(b.fields.alt)} loading="lazy" className="w-full rounded-[2rem] object-cover" />
                  {s(b.fields.caption) ? <figcaption className="mt-3 text-sm text-teal-900/60">{s(b.fields.caption)}</figcaption> : null}
                </figure>
              </Reveal>
            ) : null
          case 'cta':
            return (
              <section key={b.id} className="container-page py-16">
                <Reveal className="rounded-[2rem] bg-teal-800 px-8 py-12 text-cream-100 sm:px-12">
                  <h2 className="display-md">{s(b.fields.title)}</h2>
                  {s(b.fields.body) ? <p className="mt-4 max-w-2xl text-lg text-cream-100/80">{s(b.fields.body)}</p> : null}
                  <div className="mt-8"><Cta label={s(b.fields.ctaLabel)} href={s(b.fields.ctaHref)} /></div>
                </Reveal>
              </section>
            )
          case 'feature-cards':
            return (
              <section key={b.id} className="container-page py-16">
                {s(b.fields.title) ? <SectionHeader title={s(b.fields.title)} /> : null}
                <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items(b).map((it, i) => (
                    <li key={i} className="rounded-3xl bg-cream-50 p-7 ring-1 ring-teal-800/10">
                      <h3 className="font-display text-xl font-semibold text-teal-800">{it.title}</h3>
                      <p className="mt-2 leading-relaxed text-teal-900/70">{it.body}</p>
                      {it.href ? <div className="mt-4"><CTAButton to={isInternal(it.href) ? it.href : undefined as never} href={isInternal(it.href) ? undefined as never : it.href} variant="link">Learn more</CTAButton></div> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )
          case 'testimonials':
            return (
              <section key={b.id} className="container-page py-16">
                {s(b.fields.title) ? <SectionHeader title={s(b.fields.title)} /> : null}
                <ul className="mt-10 grid gap-5 md:grid-cols-2">
                  {items(b).map((it, i) => (
                    <li key={i}>
                      <figure className="h-full rounded-3xl bg-cream-50 p-8 ring-1 ring-teal-800/10">
                        <blockquote className="font-display text-xl leading-snug text-teal-800"><p>“{it.quote}”</p></blockquote>
                        <figcaption className="mt-5 text-sm text-teal-900/65"><strong className="text-teal-900">{it.name}</strong>{it.context ? ` · ${it.context}` : ''}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            )
          case 'faq':
            return (
              <section key={b.id} className="container-page py-16">
                {s(b.fields.title) ? <SectionHeader title={s(b.fields.title)} /> : null}
                <Accordion className="mt-8" items={items(b).filter((i) => i.question).map((i) => ({ question: i.question, answer: i.answer ?? '' }))} />
              </section>
            )
          case 'statistics':
            return (
              <section key={b.id} className="container-page py-16">
                {s(b.fields.title) ? <SectionHeader title={s(b.fields.title)} /> : null}
                <dl className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {items(b).map((it, i) => (
                    <div key={i} className="rounded-3xl bg-teal-800 p-7 text-cream-100">
                      <dd className="font-display text-4xl font-bold">{it.value}</dd>
                      <dt className="mt-1 text-cream-100/75">{it.label}</dt>
                    </div>
                  ))}
                </dl>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
