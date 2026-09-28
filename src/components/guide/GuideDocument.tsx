import '@fontsource-variable/source-serif-4/opsz.css'
import '@fontsource-variable/source-serif-4/opsz-italic.css'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { GuideBlock, GuidePage, StudyGuide } from '../../types'
import { Img } from '../ui/Img'

/**
 * Booklet-style study guide: a cover plus pages, laid out as two-page book
 * spreads on large screens and single pages on phones. Prints as a booklet
 * (one page per sheet). Used by the public reader and the admin preview.
 */

const SERIF = "'Source Serif 4 Variable', 'Source Serif 4', Georgia, 'Times New Roman', serif"
const smallCaps = 'font-display text-[0.68rem] font-semibold uppercase tracking-[0.26em]'

/* ------------------------------------------------------------------ */
/* Private journal: answers are stored only in this browser            */
/* ------------------------------------------------------------------ */

function useJournal(key: string, enabled: boolean) {
  const [value, setValue] = useState('')
  useEffect(() => {
    if (!enabled) return
    try {
      setValue(localStorage.getItem(key) ?? '')
    } catch {
      /* storage unavailable */
    }
  }, [key, enabled])
  const update = (v: string) => {
    setValue(v)
    try {
      if (v) localStorage.setItem(key, v)
      else localStorage.removeItem(key)
    } catch {
      /* storage unavailable */
    }
  }
  return [value, update] as const
}

/** Ruled answer space. Interactive on screen (saved locally); plain lines in print. */
function AnswerLines({ lines, storageKey, journal, label }: { lines: number; storageKey: string; journal: boolean; label: string }) {
  const [value, setValue] = useJournal(storageKey, journal)
  const height = `${lines * 1.9}rem`
  const ruled = 'bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(1.9rem-1px),rgb(4_39_46/0.22)_calc(1.9rem-1px),rgb(4_39_46/0.22)_1.9rem)]'
  if (!journal) return <div aria-hidden="true" className={cn('mt-2', ruled)} style={{ height }} />
  return (
    <textarea
      aria-label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      rows={lines}
      className={cn('mt-2 block w-full resize-none border-0 bg-transparent p-0 text-[0.95rem] leading-[1.9rem] text-teal-900 focus:ring-0 focus:outline-none print:text-black', ruled)}
      style={{ minHeight: height, fontFamily: SERIF, fontStyle: 'italic' }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

function Block({ block, guideSlug, journal }: { block: GuideBlock; guideSlug: string; journal: boolean }) {
  const text = block.text ?? ''
  switch (block.type) {
    case 'eyebrow':
      return <p className={cn(smallCaps, 'mt-2 text-center text-coral-700 print:text-black')}>{text}</p>
    case 'title':
      return (
        <h2 className="mt-3 mb-8 text-center text-[1.85rem] leading-tight font-semibold text-teal-950 sm:text-[2.1rem]" style={{ fontFamily: SERIF, letterSpacing: '-0.01em' }}>
          {text}
        </h2>
      )
    case 'heading':
      return <h3 className={cn(smallCaps, 'mt-8 mb-3 text-center text-teal-950 first:mt-0')}>{text}</h3>
    case 'paragraph':
      return (
        <>
          {text
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i} className="mb-4 text-justify [hyphens:auto] text-[0.98rem] leading-[1.75] text-teal-950/90" lang="en">
                {p}
              </p>
            ))}
        </>
      )
    case 'scripture':
      return (
        <figure className="mx-auto my-6 max-w-[88%] text-center">
          <blockquote className="text-[1rem] leading-[1.7] text-teal-950 italic">
            <p>{text}</p>
          </blockquote>
          {block.reference ? <figcaption className={cn(smallCaps, 'mt-2 text-[0.62rem] text-teal-900/70')}>{block.reference}</figcaption> : null}
        </figure>
      )
    case 'exercise':
      return (
        <h3 className="mt-10 mb-2 text-[1.7rem] leading-tight font-normal text-teal-950 italic first:mt-0" style={{ fontFamily: SERIF }}>
          {text}
        </h3>
      )
    case 'label':
      return <h4 className={cn(smallCaps, 'mt-8 mb-3 text-teal-950 first:mt-0')}>{text}</h4>
    case 'questions': {
      const start = block.start ?? 1
      return (
        <ol className="mb-4 space-y-5" start={start}>
          {(block.items ?? []).map((q, i) => (
            <li key={i} className="text-[0.98rem] leading-[1.65] text-teal-950/90">
              <p>
                <span className="mr-1.5 font-semibold text-teal-950">{start + i}.</span>
                {q}
              </p>
              <AnswerLines lines={block.lines ?? 3} storageKey={`gh-guide:${guideSlug}:${block.id}:${i}`} journal={journal} label={`Your answer to question ${start + i}`} />
            </li>
          ))}
        </ol>
      )
    }
    case 'points':
      return (
        <ul className="mb-5 space-y-2.5">
          {(block.items ?? []).map((p, i) => (
            <li key={i} className="flex gap-3 text-[0.98rem] leading-[1.65] text-teal-950/90">
              <span aria-hidden="true" className="mt-[0.62em] size-1.5 shrink-0 rotate-45 bg-coral-500 print:bg-black" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )
    case 'note':
      return <p className="my-5 border-l-2 border-coral-400 pl-4 text-[0.92rem] leading-relaxed text-teal-900/75 italic print:border-black">{text}</p>
    case 'divider':
      return (
        <p aria-hidden="true" className="my-8 text-center tracking-[1em] text-teal-900/35">
          ✦ ✦ ✦
        </p>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function Paper({ children, side, number, footer, className }: { children: ReactNode; side: 'left' | 'right' | 'single'; number?: number; footer?: string; className?: string }) {
  return (
    <section
      className={cn(
        'guide-page relative flex min-h-[40rem] flex-col bg-[#fcfaf6] px-7 pt-12 pb-16 sm:px-12 lg:px-14 print:min-h-0 print:bg-white print:px-0 print:pt-0 print:shadow-none',
        side === 'left' && 'lg:shadow-[inset_-28px_0_40px_-30px_rgb(4_39_46/0.28)]',
        side === 'right' && 'lg:shadow-[inset_28px_0_40px_-30px_rgb(4_39_46/0.28)]',
        className,
      )}
      style={{ fontFamily: SERIF }}
    >
      <div className="flex-1">{children}</div>
      {number ? (
        <footer className={cn('absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 px-8 print:hidden', smallCaps, 'text-[0.58rem] text-teal-900/45')}>
          {side !== 'right' ? <span>{number}</span> : null}
          <span className="h-px w-6 bg-teal-900/20" />
          <span className="truncate">{footer}</span>
          <span className="h-px w-6 bg-teal-900/20" />
          {side === 'right' ? <span>{number}</span> : null}
        </footer>
      ) : null}
    </section>
  )
}

function Cover({ guide }: { guide: StudyGuide }) {
  return (
    <section className="guide-page relative isolate flex min-h-[40rem] flex-col overflow-hidden bg-teal-950 px-8 py-12 text-cream-100 sm:px-12 print:min-h-[90vh]">
      {guide.coverImage ? (
        <Img name={guide.coverImage} decorative sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0 -z-20 size-full object-cover grayscale-[35%]" />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(2_27_32/0.55)_0%,rgb(2_27_32/0.25)_40%,rgb(2_27_32/0.85)_100%)]" />
      <p className={cn(smallCaps, 'text-cream-100/85')}>{guide.series ?? 'Global Harvest'}</p>
      <div className="mt-auto">
        {guide.isPlaceholder ? <p className={cn(smallCaps, 'mb-4 inline-block rounded-full border border-dashed border-cream-100/50 px-3 py-1 text-[0.58rem]')}>Sample guide</p> : null}
        <h1 className="text-[2.9rem] leading-[0.98] font-semibold tracking-tight sm:text-[3.6rem]" style={{ fontFamily: SERIF }}>
          {guide.title}
        </h1>
        {guide.subtitle ? (
          <p className="mt-4 max-w-sm text-lg text-cream-100/85 italic" style={{ fontFamily: SERIF }}>
            {guide.subtitle}
          </p>
        ) : null}
        <div className="mt-8 h-px w-16 bg-coral-400" />
        <p className={cn(smallCaps, 'mt-4 text-[0.6rem] text-cream-100/60')}>Global Harvest · Study · Pray · Share</p>
      </div>
    </section>
  )
}

interface GuideDocumentProps {
  guide: StudyGuide
  /** Enables the private on-device answer journal (public reader). */
  journal?: boolean
  className?: string
}

export function GuideDocument({ guide, journal = false, className }: GuideDocumentProps) {
  // Sheets: cover first, then each page. Pair into spreads on large screens.
  const sheets: ({ kind: 'cover' } | { kind: 'page'; page: GuidePage; number: number })[] = [
    { kind: 'cover' },
    ...guide.pages.map((page, i) => ({ kind: 'page' as const, page, number: i + 1 })),
  ]
  const spreads: (typeof sheets)[] = []
  for (let i = 0; i < sheets.length; i += 2) spreads.push(sheets.slice(i, i + 2))

  const render = (sheet: (typeof sheets)[number], side: 'left' | 'right') =>
    sheet.kind === 'cover' ? (
      <Cover key="cover" guide={guide} />
    ) : (
      <Paper key={sheet.page.id} side={side} number={sheet.number} footer={guide.title}>
        {sheet.page.blocks.map((b) => (
          <Block key={b.id} block={b} guideSlug={guide.slug} journal={journal} />
        ))}
      </Paper>
    )

  return (
    <div className={cn('guide-document space-y-8 lg:space-y-12 print:space-y-0', className)}>
      {spreads.map((spread, i) => (
        <div
          key={i}
          className="grid overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgb(4_39_46/0.45),0_2px_6px_rgb(4_39_46/0.08)] ring-1 ring-teal-950/5 lg:grid-cols-2 print:block print:overflow-visible print:shadow-none print:ring-0"
        >
          {render(spread[0], 'left')}
          {spread[1] ? render(spread[1], 'right') : <div aria-hidden="true" className="hidden bg-[#f7f3ec] lg:block print:hidden" />}
        </div>
      ))}
    </div>
  )
}
