import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../config/site'

export interface SeoOptions {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article' | 'event'
  noindex?: boolean
  /** Structured data (JSON-LD) for this page. */
  jsonLd?: Record<string, unknown>
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Sets title, description, canonical, Open Graph and Twitter tags per route.
 * index.html ships the homepage defaults so crawlers that don't run JS still
 * get meaningful tags; this hook keeps them accurate during navigation.
 */
export function useSeo({ title, description, image, type = 'website', noindex, jsonLd }: SeoOptions) {
  const { pathname } = useLocation()
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Bible Study, Prayer & Global Community`
    const desc = description ?? site.description
    const url = `${site.url}${pathname === '/' ? '' : pathname}`
    const img = `${site.url}${image ?? site.ogImage}`

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', url)

    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', type === 'event' ? 'website' : type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', img)
    upsertMeta('property', 'og:site_name', site.name)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)

    const existing = document.getElementById('page-jsonld')
    existing?.remove()
    if (jsonLdString) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'page-jsonld'
      script.textContent = jsonLdString
      document.head.appendChild(script)
    }
  }, [title, description, image, type, noindex, pathname, jsonLdString])
}
