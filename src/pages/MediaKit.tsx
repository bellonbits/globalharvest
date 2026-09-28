import { useRef, useState } from 'react'
import { Logo } from '../components/brand/Logo'
import { SentMark } from '../components/brand/SentMark'
import { Whale } from '../components/brand/Whale'
import { posterFormats, posterTemplates, type PosterFormat } from '../components/posters/Posters'
import { PageHero } from '../components/sections/PageHero'
import { CTAButton } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useToast } from '../components/ui/Toast'
import { useSeo } from '../hooks/useSeo'
import { cn } from '../lib/cn'

const palette = [
  { name: 'Sunset Coral', token: 'coral-400', hex: '#F28A68', className: 'bg-coral-400 text-teal-950' },
  { name: 'Terracotta', token: 'coral-600', hex: '#C24F2D', className: 'bg-coral-600 text-cream-50' },
  { name: 'Deep Ocean', token: 'teal-600', hex: '#064B57', className: 'bg-teal-600 text-cream-50' },
  { name: 'Dark Navy', token: 'teal-800', hex: '#06343D', className: 'bg-teal-800 text-cream-50' },
  { name: 'Abyss', token: 'teal-900', hex: '#04272E', className: 'bg-teal-900 text-cream-50' },
  { name: 'Cream', token: 'cream-100', hex: '#FFF7EE', className: 'bg-cream-100 text-teal-800 ring-1 ring-teal-800/10' },
]

type TemplateKey = (typeof posterTemplates)[number]['key']

export default function MediaKit() {
  useSeo({ title: 'Media Kit', description: 'Global Harvest brand assets, colours, typography and ready-to-share poster and social media templates.' })
  const [format, setFormat] = useState<PosterFormat>('portrait')
  const [open, setOpen] = useState<TemplateKey | null>(null)
  const [busy, setBusy] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const { notify } = useToast()
  const active = posterTemplates.find((t) => t.key === open)

  const download = async () => {
    if (!exportRef.current || !active) return
    setBusy(true)
    try {
      const { toPng } = await import('html-to-image')
      const node = exportRef.current
      const [w] = posterFormats[format].px
      const dataUrl = await toPng(node, { pixelRatio: w / node.offsetWidth, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `global-harvest-${active.key}-${format}.png`
      a.click()
      notify({ tone: 'success', title: 'Download ready', message: `${posterFormats[format].px.join(' × ')} PNG` })
    } catch {
      notify({ tone: 'error', title: 'Export failed', message: 'Please try again, or take a screenshot of the preview.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Media Kit"
        title={
          <>
            Share the
            <br />
            invitation.
          </>
        }
        description="Brand assets and ready-made templates for posters, Instagram, TikTok and WhatsApp — all built from the same design system as this website."
        image="ocean-teal"
      />

      <section className="bg-cream-100 py-20 sm:py-28" aria-labelledby="templates-title">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeader id="templates-title" eyebrow="Templates" title="Posters & social cards." description="Choose a format, open a template and download a high-resolution PNG." />
            <div role="group" aria-label="Poster format" className="flex gap-1.5 rounded-full border border-teal-800/15 bg-cream-50 p-1.5">
              {(Object.keys(posterFormats) as PosterFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={format === f}
                  onClick={() => setFormat(f)}
                  className={cn('rounded-full px-4 py-2 font-display text-sm font-semibold transition', format === f ? 'bg-teal-800 text-cream-100' : 'text-teal-800 hover:bg-teal-800/5')}
                >
                  {posterFormats[f].label}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-14 grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {posterTemplates.map(({ key, name, Component }, i) => (
              <Reveal as="li" key={key} delay={i * 0.05}>
                <button type="button" onClick={() => setOpen(key)} className="group block w-full text-left" aria-label={`Open ${name}`}>
                  <div className="overflow-hidden rounded-2xl shadow-soft ring-1 ring-teal-800/10 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lift">
                    <Component format={format} />
                  </div>
                  <p className="mt-4 font-display font-semibold text-teal-800">{name}</p>
                  <p className="text-sm text-teal-900/60">{posterFormats[format].use}</p>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream-200/60 py-20 sm:py-28" aria-labelledby="brand-title">
        <div className="container-page">
          <SectionHeader id="brand-title" eyebrow="Brand" title="The Global Harvest identity." />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Reveal className="rounded-[2rem] bg-cream-50 p-10 ring-1 ring-teal-800/10">
              <p className="eyebrow text-coral-700">Primary mark</p>
              <SentMark className="mt-8" />
              <p className="mt-6 text-sm text-teal-900/65">Use on cream, coral or deep teal backgrounds. Keep clear space equal to the height of the “E” around the mark.</p>
            </Reveal>
            <div className="grid gap-6">
              <Reveal delay={0.05} className="flex items-center justify-between gap-6 rounded-[2rem] bg-teal-800 p-10">
                <Logo tone="light" withTagline size="lg" asLink={false} />
              </Reveal>
              <Reveal delay={0.1} className="flex items-center justify-between gap-6 rounded-[2rem] bg-coral-400 p-10">
                <Logo tone="dark" size="lg" asLink={false} />
                <Whale className="w-40" />
              </Reveal>
            </div>
          </div>

          <h3 className="mt-16 font-display text-2xl font-semibold text-teal-800">Colour</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {palette.map((c) => (
              <li key={c.token} className={cn('flex aspect-[4/5] flex-col justify-end rounded-2xl p-5', c.className)}>
                <p className="font-display font-semibold">{c.name}</p>
                <p className="text-sm opacity-80">{c.hex}</p>
                <p className="font-mono text-xs opacity-60">{c.token}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-16 font-display text-2xl font-semibold text-teal-800">Typography</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-cream-50 p-8 ring-1 ring-teal-800/10">
              <p className="eyebrow text-coral-700">Display · Outfit</p>
              <p className="mt-4 font-display text-5xl font-bold tracking-tight text-teal-800">Sent into the world.</p>
            </div>
            <div className="rounded-2xl bg-cream-50 p-8 ring-1 ring-teal-800/10">
              <p className="eyebrow text-coral-700">Body · DM Sans</p>
              <p className="mt-4 text-lg leading-relaxed text-teal-900/80">A community committed to studying God’s Word, seeking God in prayer and growing together in faith.</p>
            </div>
            <div className="rounded-2xl bg-cream-50 p-8 ring-1 ring-teal-800/10">
              <p className="eyebrow text-coral-700">Accent · Allura</p>
              <p className="mt-2 font-script text-7xl text-teal-800">You’re Invited</p>
            </div>
          </div>
        </div>
      </section>

      <Modal open={Boolean(active)} onClose={() => setOpen(null)} title={active?.name ?? ''} className="max-w-xl">
        {active ? (
          <div>
            <div className={cn('mx-auto', format === 'story' ? 'max-w-[300px]' : 'max-w-[440px]')}>
              <active.Component ref={exportRef} format={format} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-teal-900/65">
                {posterFormats[format].label} · {posterFormats[format].px.join(' × ')}px
              </p>
              <CTAButton onClick={download} disabled={busy} icon="download">
                {busy ? 'Preparing…' : 'Download PNG'}
              </CTAButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
