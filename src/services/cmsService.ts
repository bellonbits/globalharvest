import { http, isApiConfigured } from './http'

/** Public view of a CMS page (only published, visible blocks are returned). */
export interface CmsBlock {
  id: string
  type: 'hero' | 'heading' | 'paragraph' | 'image' | 'cta' | 'feature-cards' | 'testimonials' | 'faq' | 'statistics' | 'banner'
  fields: Record<string, unknown>
}
export interface CmsPage {
  slug: string
  title: string
  blocks: CmsBlock[]
  updatedAt: string
}

const cache = new Map<string, Promise<CmsPage | null>>()

/**
 * Reads admin-managed page content. Pages fall back to their built-in
 * content whenever the API is off, the page isn't published, or a request fails.
 */
export const cmsService = {
  getPage(slug: string): Promise<CmsPage | null> {
    if (!isApiConfigured) return Promise.resolve(null)
    if (!cache.has(slug)) {
      cache.set(
        slug,
        http
          .get<{ page: CmsPage | null }>(`/v1/public/content/${encodeURIComponent(slug)}`)
          .then((r) => r.page)
          .catch(() => null),
      )
    }
    return cache.get(slug)!
  },
}
