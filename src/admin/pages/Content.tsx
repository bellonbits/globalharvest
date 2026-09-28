import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/brand/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, EmptyState, ErrorState, IconButton, LoadingBlock, PageHeader, SelectField, StatusBadge, TextAreaField, TextField } from '../components/ui'
import { formatDateTime, labelize, useResource } from '../lib/hooks'
import { contentService } from '../services'
import type { ContentBlock, ContentBlockType, ContentPage, ContentPageKey } from '../types'

const PAGES: { key: ContentPageKey; label: string; path: string }[] = [
  { key: 'home', label: 'Homepage', path: '/' },
  { key: 'about', label: 'About', path: '/about' },
  { key: 'bible-study', label: 'Bible Study', path: '/bible-study' },
  { key: 'prayer', label: 'Prayer', path: '/prayer' },
  { key: 'community', label: 'Community', path: '/community' },
  { key: 'mission', label: 'Mission', path: '/mission' },
  { key: 'contact', label: 'Contact', path: '/contact' },
  { key: 'join', label: 'Join', path: '/join' },
]

/** Field definitions per block type. `items` blocks hold repeatable rows. */
const BLOCKS: Record<ContentBlockType, { label: string; fields: { name: string; label: string; long?: boolean }[]; items?: { name: string; label: string; long?: boolean }[] }> = {
  hero: { label: 'Hero', fields: [{ name: 'eyebrow', label: 'Eyebrow' }, { name: 'title', label: 'Title' }, { name: 'body', label: 'Supporting text', long: true }, { name: 'imageUrl', label: 'Background image URL' }, { name: 'ctaLabel', label: 'Button label' }, { name: 'ctaHref', label: 'Button link' }] },
  heading: { label: 'Heading', fields: [{ name: 'eyebrow', label: 'Eyebrow' }, { name: 'title', label: 'Heading' }] },
  paragraph: { label: 'Paragraph', fields: [{ name: 'body', label: 'Text', long: true }] },
  image: { label: 'Image', fields: [{ name: 'imageUrl', label: 'Image URL' }, { name: 'alt', label: 'Alt text (describe the image)' }, { name: 'caption', label: 'Caption' }] },
  cta: { label: 'Call to action', fields: [{ name: 'title', label: 'Title' }, { name: 'body', label: 'Text', long: true }, { name: 'ctaLabel', label: 'Button label' }, { name: 'ctaHref', label: 'Button link' }] },
  'feature-cards': { label: 'Feature cards', fields: [{ name: 'title', label: 'Section title' }], items: [{ name: 'title', label: 'Card title' }, { name: 'body', label: 'Card text', long: true }, { name: 'href', label: 'Link' }] },
  testimonials: { label: 'Testimonials', fields: [{ name: 'title', label: 'Section title' }], items: [{ name: 'quote', label: 'Quote (real, with permission)', long: true }, { name: 'name', label: 'Name' }, { name: 'context', label: 'Context' }] },
  faq: { label: 'FAQ', fields: [{ name: 'title', label: 'Section title' }], items: [{ name: 'question', label: 'Question' }, { name: 'answer', label: 'Answer', long: true }] },
  statistics: { label: 'Statistics', fields: [{ name: 'title', label: 'Section title' }], items: [{ name: 'value', label: 'Value (real figures only)' }, { name: 'label', label: 'Label' }] },
  banner: { label: 'Announcement banner', fields: [{ name: 'body', label: 'Message' }, { name: 'ctaLabel', label: 'Link label' }, { name: 'ctaHref', label: 'Link' }] },
}

function BlockEditor({ block, onChange, onRemove, onMove, first, last }: { block: ContentBlock; onChange: (b: ContentBlock) => void; onRemove: () => void; onMove: (d: -1 | 1) => void; first: boolean; last: boolean }) {
  const def = BLOCKS[block.type]
  const set = (name: string, value: unknown) => onChange({ ...block, fields: { ...block.fields, [name]: value } })
  const items = (block.fields.items as Record<string, string>[] | undefined) ?? []
  return (
    <li className="rounded-xl bg-white ring-1 ring-teal-900/10">
      <div className="flex items-center justify-between gap-2 border-b border-teal-900/8 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium text-teal-900">
          <Icon name="grid" size={15} className="text-teal-900/40" /> {def.label}
          {!block.visible ? <span className="text-xs text-teal-900/45">(hidden)</span> : null}
        </span>
        <span className="flex items-center">
          <IconButton icon="chevronUp" label="Move block up" disabled={first} onClick={() => onMove(-1)} />
          <IconButton icon="chevronDown" label="Move block down" disabled={last} onClick={() => onMove(1)} />
          <IconButton icon={block.visible ? 'eye' : 'eyeOff'} label={block.visible ? 'Hide block' : 'Show block'} onClick={() => onChange({ ...block, visible: !block.visible })} />
          <IconButton icon="trash" label="Remove block" onClick={onRemove} />
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {def.fields.map((f) =>
          f.long ? (
            <TextAreaField key={f.name} label={f.label} rows={3} className="sm:col-span-2" value={(block.fields[f.name] as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />
          ) : (
            <TextField key={f.name} label={f.label} value={(block.fields[f.name] as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />
          ),
        )}
        {def.items ? (
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-teal-900">Items</p>
            <ol className="space-y-3">
              {items.map((it, i) => (
                <li key={i} className="grid gap-3 rounded-lg bg-cream-50/70 p-3 ring-1 ring-teal-900/8 sm:grid-cols-2">
                  {def.items!.map((f) =>
                    f.long ? (
                      <TextAreaField key={f.name} label={f.label} rows={2} className="sm:col-span-2" value={it[f.name] ?? ''} onChange={(e) => set('items', items.map((x, j) => (j === i ? { ...x, [f.name]: e.target.value } : x)))} />
                    ) : (
                      <TextField key={f.name} label={f.label} value={it[f.name] ?? ''} onChange={(e) => set('items', items.map((x, j) => (j === i ? { ...x, [f.name]: e.target.value } : x)))} />
                    ),
                  )}
                  <div className="sm:col-span-2">
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => set('items', items.filter((_, j) => j !== i))}>Remove item</Button>
                  </div>
                </li>
              ))}
            </ol>
            <Button size="sm" className="mt-3" icon="plus" onClick={() => set('items', [...items, {}])}>Add item</Button>
          </div>
        ) : null}
      </div>
    </li>
  )
}

export default function Content() {
  const { can } = useAuth()
  const { notify } = useToast()
  const [pageKey, setPageKey] = useState<ContentPageKey>('home')
  const { data, loading, error, reload } = useResource(() => contentService.list({ pageSize: 50 }), [])
  const record = useMemo(() => data?.items.find((p) => p.slug === pageKey) ?? null, [data, pageKey])
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newType, setNewType] = useState<ContentBlockType>('hero')
  const canWrite = can('content:write')

  useEffect(() => {
    setBlocks(record?.blocks ?? [])
    setDirty(false)
  }, [record])

  const change = (next: ContentBlock[]) => {
    setBlocks(next)
    setDirty(true)
  }

  const save = async (status: ContentPage['status']) => {
    setSaving(true)
    try {
      const page = PAGES.find((p) => p.key === pageKey)!
      const payload = { slug: pageKey, title: page.label, blocks, status, publishedAt: status === 'published' ? new Date().toISOString() : record?.publishedAt }
      if (record) await contentService.update(record.id, payload)
      else await contentService.create(payload)
      notify({ tone: 'success', title: status === 'published' ? 'Page published' : 'Draft saved', message: status === 'published' ? 'Changes are live on the website within a minute.' : undefined })
      setDirty(false)
      reload()
    } catch (e) {
      notify({ tone: 'error', title: 'Save failed', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const current = PAGES.find((p) => p.key === pageKey)!
  return (
    <>
      <PageHeader
        title="Website content"
        description="Edit page content blocks. Published blocks override the website’s default copy for that page; everything else keeps its built-in design."
        actions={
          canWrite ? (
            <>
              <Button icon="arrowUpRight" onClick={() => window.open(current.path, '_blank', 'noopener')}>Preview page</Button>
              <Button onClick={() => save('draft')} loading={saving} disabled={!dirty && Boolean(record)}>Save draft</Button>
              <Button variant="primary" onClick={() => save('published')} loading={saving}>Publish</Button>
            </>
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Pages" className="min-w-0 rounded-xl bg-white p-2 ring-1 ring-teal-900/10 lg:self-start">
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {PAGES.map((p) => {
              const rec = data?.items.find((x) => x.slug === p.key)
              return (
                <li key={p.key}>
                  <button type="button" aria-current={pageKey === p.key ? 'page' : undefined} onClick={() => (!dirty || confirm('Discard unsaved changes?')) && setPageKey(p.key)} className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${pageKey === p.key ? 'bg-teal-800 text-white' : 'text-teal-900 hover:bg-cream-50'}`}>
                    {p.label}
                    {rec ? <span className={`size-1.5 rounded-full ${rec.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-label={rec.status} /> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="min-w-0">
          {error ? (
            <Card><ErrorState error={error} onRetry={reload} what="content" /></Card>
          ) : loading && !data ? (
            <Card><LoadingBlock /></Card>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-teal-900/65">
                <span className="font-display text-lg font-semibold text-teal-900">{current.label}</span>
                {record ? <StatusBadge status={record.status} /> : <span>Using built-in content</span>}
                {record ? <span>Updated {formatDateTime(record.updatedAt)}</span> : null}
                {dirty ? <span className="font-medium text-amber-700">Unsaved changes</span> : null}
              </div>
              {blocks.length ? (
                <ol className="space-y-4">
                  {blocks.map((b, i) => (
                    <BlockEditor
                      key={b.id}
                      block={b}
                      first={i === 0}
                      last={i === blocks.length - 1}
                      onChange={(nb) => change(blocks.map((x) => (x.id === b.id ? nb : x)))}
                      onRemove={() => change(blocks.filter((x) => x.id !== b.id))}
                      onMove={(d) => {
                        const n = [...blocks]
                        n.splice(i, 1)
                        n.splice(i + d, 0, b)
                        change(n)
                      }}
                    />
                  ))}
                </ol>
              ) : (
                <Card><EmptyState icon="file" title="No custom blocks for this page" body="The page shows its built-in content. Add a block (e.g. Hero) to override it." /></Card>
              )}
              {canWrite ? (
                <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-teal-900/20 p-4">
                  <SelectField label="Add a block" value={newType} onChange={(e) => setNewType(e.target.value as ContentBlockType)} options={Object.entries(BLOCKS).map(([k, v]) => ({ value: k, label: v.label }))} />
                  <Button icon="plus" onClick={() => change([...blocks, { id: crypto.randomUUID(), type: newType, fields: BLOCKS[newType].items ? { items: [] } : {}, visible: true }])}>Add {labelize(BLOCKS[newType].label).toLowerCase()}</Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  )
}
