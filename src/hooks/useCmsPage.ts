import { useEffect, useState } from 'react'
import { cmsService, type CmsBlock, type CmsPage } from '../services/cmsService'

export function useCmsPage(slug: string | undefined) {
  const [page, setPage] = useState<CmsPage | null>(null)
  useEffect(() => {
    if (!slug) return
    let alive = true
    cmsService.getPage(slug).then((p) => alive && setPage(p))
    return () => {
      alive = false
    }
  }, [slug])
  const hero = page?.blocks.find((b) => b.type === 'hero') as CmsBlock | undefined
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)
  return {
    page,
    hero: hero
      ? { eyebrow: str(hero.fields.eyebrow), title: str(hero.fields.title), body: str(hero.fields.body), imageUrl: str(hero.fields.imageUrl), ctaLabel: str(hero.fields.ctaLabel), ctaHref: str(hero.fields.ctaHref) }
      : null,
    sections: page?.blocks.filter((b) => b.type !== 'hero') ?? [],
  }
}
