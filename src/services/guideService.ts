import { sampleGuides } from '../content/guides.js'
import type { GuideKind, StudyGuide } from '../types'
import { http, isApiConfigured } from './http'

let published: Promise<StudyGuide[]> | null = null

/** Guides published from the admin portal (summaries, no pages). */
function publishedGuides(): Promise<StudyGuide[]> {
  if (!isApiConfigured) return Promise.resolve([])
  published ??= http.get<{ guides: StudyGuide[] }>('/v1/public/guides').then((r) => r.guides).catch(() => [])
  return published
}

/**
 * Study guides for the public site. Sample guides are shown only until at
 * least one real guide of that kind has been published.
 */
export const guideService = {
  async list(kind?: GuideKind): Promise<StudyGuide[]> {
    const real = (await publishedGuides()).filter((g) => !kind || g.kind === kind)
    if (real.some((g) => !g.isPlaceholder)) return real
    return [...real, ...sampleGuides.filter((g) => !kind || g.kind === kind)]
  },
  async get(slug: string): Promise<StudyGuide | null> {
    if (isApiConfigured) {
      try {
        const r = await http.get<{ guide: StudyGuide | null }>(`/v1/public/guides/${encodeURIComponent(slug)}`)
        if (r.guide) return r.guide
      } catch {
        /* fall through to samples */
      }
    }
    return sampleGuides.find((g) => g.slug === slug) ?? null
  },
}
