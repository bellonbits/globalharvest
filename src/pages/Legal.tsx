import type { ReactNode } from 'react'
import { PageHero } from '../components/sections/PageHero'
import { PlaceholderNotice } from '../components/ui/PlaceholderBadge'

/** Shared layout for Privacy Policy and Terms. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Last updated: ${updated}`} />
      <section className="bg-cream-100 py-16 sm:py-24">
        <div className="container-page">
          <PlaceholderNotice className="mb-12 max-w-3xl">
            This is a starting template, not legal advice. Please have it reviewed by a qualified professional and completed with Global Harvest’s legal entity name, address and contact details before launch.
          </PlaceholderNotice>
          <article className="prose-gh">{children}</article>
        </div>
      </section>
    </>
  )
}
