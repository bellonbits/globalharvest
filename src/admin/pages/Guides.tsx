import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/brand/Icon'
import { GuideDocument } from '../../components/guide/GuideDocument'
import { GUIDE_KIND_LABEL } from '../../components/guide/guideMeta'
import { useToast } from '../../components/ui/Toast'
import { imageManifest } from '../../content/images.generated'
import type { GuideBlock, GuideBlockType, GuideKind, GuidePage, StudyGuide } from '../../types'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { Button, Card, ConfirmDialog, DemoTag, ErrorState, FilterSelect, IconButton, LoadingBlock, PageHeader, SearchInput, SelectField, StatusBadge, Tabs, TextAreaField, TextField } from '../components/ui'
import { formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { bibleStudyService, guideService } from '../services'

type GuideRecord = StudyGuide & { id: string; isDemo?: boolean; createdAt: string; updatedAt: string }

const KINDS = Object.entries(GUIDE_KIND_LABEL).map(([value, label]) => ({ value, label }))
const STATUSES = ['draft', 'published', 'archived'] as const
const uid = () => crypto.randomUUID()

const BLOCKS: Record<GuideBlockType, { label: string; hint: string }> = {
  eyebrow: { label: 'Eyebrow', hint: 'Small caps above a title, e.g. BACKGROUND' },
  title: { label: 'Page title', hint: 'Large serif title' },
  heading: { label: 'Section heading', hint: 'Centred small caps, e.g. WHO WROTE THE BOOK?' },
  paragraph: { label: 'Paragraph', hint: 'Justified text. Leave a blank line between paragraphs.' },
  scripture: { label: 'Scripture', hint: 'Quotation with its reference' },
  exercise: { label: 'Exercise title', hint: 'e.g. Exercise One, Day Two' },
  label: { label: 'Stage label', hint: 'e.g. OBSERVATION: WHAT DOES IT SAY?' },
  questions: { label: 'Numbered questions', hint: 'One question per line — each gets answer lines' },
  points: { label: 'Prayer points / list', hint: 'One point per line' },
  note: { label: 'Note', hint: 'Boxed italic callout' },
  divider: { label: 'Divider', hint: 'Ornamental break' },
}

const b = (type: GuideBlockType, extra: Partial<GuideBlock> = {}): GuideBlock => ({ id: uid(), type, ...extra })

/** Starting structures that follow the booklet format. */
function template(kind: GuideKind): GuidePage[] {
  if (kind === 'prayer')
    return [
      { id: uid(), blocks: [b('eyebrow', { text: 'Introduction' }), b('title', { text: 'Title of this prayer guide' }), b('paragraph', { text: 'Why we are praying and how to use this guide.' }), b('scripture', { text: '', reference: '' })] },
      { id: uid(), blocks: [b('exercise', { text: 'Day One' }), b('label', { text: 'Pray for…' }), b('scripture', { text: '', reference: '' }), b('points', { items: ['First prayer point', 'Second prayer point'] }), b('questions', { items: ['What is God placing on your heart?'], lines: 3, start: 1 })] },
    ]
  return [
    {
      id: uid(),
      blocks: [
        b('eyebrow', { text: 'Background' }),
        b('title', { text: 'Book & author' }),
        b('heading', { text: 'Who wrote it?' }),
        b('paragraph', { text: '' }),
        b('heading', { text: 'Date and audience:' }),
        b('paragraph', { text: '' }),
        b('heading', { text: 'Purpose:' }),
        b('paragraph', { text: '' }),
      ],
    },
    {
      id: uid(),
      blocks: [
        b('exercise', { text: 'Exercise One' }),
        b('label', { text: 'Desperation' }),
        b('paragraph', { text: 'Begin your study in humility, remembering that you are not here merely to study, but to worship. Pray through the passages below.' }),
        b('scripture', { text: '', reference: '' }),
        b('label', { text: 'Observation: What does it say?' }),
        b('paragraph', { text: 'Read the passage several times and write down every detail you notice.' }),
        b('points', { items: ['Are there any words you do not know?', 'Is there context you need to clarify?', 'What is the overall tone of the passage?'] }),
      ],
    },
    {
      id: uid(),
      blocks: [
        b('label', { text: 'Interpretation: What does it mean?' }),
        b('questions', { items: [''], lines: 3, start: 1 }),
        b('label', { text: 'Application: How should it change me?' }),
        b('questions', { items: ['What does this passage teach us about the nature and character of God?', 'What does it teach us about ourselves?'], lines: 3, start: 2 }),
      ],
    },
  ]
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

export default function Guides() {
  const { can } = useAuth()
  const { state, update, query } = useListState(['status', 'kind'], { sort: 'updatedAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => guideService.list(query), [JSON.stringify(query)])
  const columns: Column<GuideRecord>[] = [
    { key: 'title', header: 'Guide', sortable: true, render: (g) => <span className="inline-flex items-center gap-2">{g.title} {g.isDemo ? <DemoTag /> : null}</span> },
    { key: 'kind', header: 'Type', render: (g) => GUIDE_KIND_LABEL[g.kind] ?? labelize(g.kind), mobile: true },
    { key: 'pages', header: 'Pages', render: (g) => g.pages?.length ?? 0 },
    { key: 'updatedAt', header: 'Updated', sortable: true, render: (g) => formatDay(g.updatedAt), mobile: true },
    { key: 'status', header: 'Status', sortable: true, render: (g) => <StatusBadge status={g.status ?? 'draft'} />, mobile: true },
  ]
  return (
    <>
      <PageHeader
        title="Study guides"
        description="Booklet-style Bible studies, prayer guides, devotionals and teaching notes. Published guides appear on the website."
        actions={
          can('guides:write') ? (
            <>
              <Button icon="prayer" to="/admin/guides/new?kind=prayer">New prayer guide</Button>
              <Button variant="primary" icon="plus" to="/admin/guides/new?kind=bible-study">New Bible study guide</Button>
            </>
          ) : null
        }
      />
      <DataTable
        what="study guides"
        storageKey="guides"
        columns={columns}
        rows={data?.items ?? null}
        total={data?.total}
        loading={loading}
        error={error}
        onRetry={reload}
        page={state.page}
        pageSize={state.pageSize}
        onPage={(page) => update({ page }, false)}
        sort={state.sort}
        dir={state.dir}
        onSort={(sort, dir) => update({ sort, dir })}
        rowHref={(g) => `/admin/guides/${g.id}/edit`}
        empty={{ title: 'No study guides yet.', body: 'Create a Bible study or prayer guide — it starts from a template in the booklet format.', action: can('guides:write') ? <Button variant="primary" icon="plus" to="/admin/guides/new?kind=bible-study">New Bible study guide</Button> : undefined }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search guides…" className="w-full sm:w-64" />
            <FilterSelect label="Type" value={state.filters.kind} onChange={(v) => update({ filters: { kind: v } })} options={KINDS} />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
          </>
        }
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function BlockEditor({ block, onChange }: { block: GuideBlock; onChange: (b: GuideBlock) => void }) {
  const set = (patch: Partial<GuideBlock>) => onChange({ ...block, ...patch })
  const meta = BLOCKS[block.type]
  switch (block.type) {
    case 'paragraph':
    case 'note':
      return <TextAreaField label={meta.label} hint={meta.hint} rows={block.type === 'paragraph' ? 5 : 2} value={block.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
    case 'scripture':
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <TextAreaField label="Scripture text" rows={2} value={block.text ?? ''} onChange={(e) => set({ text: e.target.value })} hint="Use a translation you have permission to quote." />
          <TextField label="Reference" placeholder="e.g. John 6:35" value={block.reference ?? ''} onChange={(e) => set({ reference: e.target.value })} />
        </div>
      )
    case 'questions':
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
          <TextAreaField label="Questions" hint={meta.hint} rows={4} value={(block.items ?? []).join('\n')} onChange={(e) => set({ items: e.target.value.split('\n') })} />
          <TextField label="Start at #" type="number" min={1} value={String(block.start ?? 1)} onChange={(e) => set({ start: Math.max(1, Number(e.target.value) || 1) })} />
          <TextField label="Answer lines" type="number" min={0} max={12} value={String(block.lines ?? 3)} onChange={(e) => set({ lines: Math.min(12, Math.max(0, Number(e.target.value) || 0)) })} />
        </div>
      )
    case 'points':
      return <TextAreaField label={meta.label} hint={meta.hint} rows={4} value={(block.items ?? []).join('\n')} onChange={(e) => set({ items: e.target.value.split('\n') })} />
    case 'divider':
      return <p className="text-sm text-teal-900/55">Ornamental divider — no settings.</p>
    default:
      return <TextField label={meta.label} hint={meta.hint} value={block.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
  }
}

/** Removes empty list lines before saving. */
const clean = (pages: GuidePage[]): GuidePage[] =>
  pages.map((p) => ({ ...p, blocks: p.blocks.map((bl) => (bl.items ? { ...bl, items: bl.items.map((i) => i.trim()).filter(Boolean) } : bl)) }))

export function GuideEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { can } = useAuth()
  const params = new URLSearchParams(window.location.search)
  const startKind = (params.get('kind') as GuideKind) || 'bible-study'
  const existing = useResource(() => (id ? guideService.get(id) : Promise.resolve(null)), [id])
  const studies = useResource(() => (can('bible_studies:read') ? bibleStudyService.list({ pageSize: 100 }) : Promise.resolve(null)), [])
  const [guide, setGuide] = useState<StudyGuide | null>(null)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [newType, setNewType] = useState<GuideBlockType>('paragraph')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canWrite = can('guides:write')

  useEffect(() => {
    if (id && existing.data) setGuide(existing.data as StudyGuide)
    if (!id)
      setGuide({
        slug: '',
        title: startKind === 'prayer' ? 'New prayer guide' : 'New Bible study guide',
        kind: startKind,
        series: startKind === 'prayer' ? 'Global Harvest Prayer Guide' : 'Global Harvest Bible Study',
        coverImage: startKind === 'prayer' ? 'nugget-point-sunset' : 'bible-golden-light',
        status: 'draft',
        pages: template(startKind),
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, existing.data])

  if (id && existing.error) return <Card><ErrorState error={existing.error} onRetry={existing.reload} what="this guide" /></Card>
  if (!guide) return <Card><LoadingBlock /></Card>

  const change = (patch: Partial<StudyGuide>) => {
    setGuide((g) => (g ? { ...g, ...patch } : g))
    setDirty(true)
  }
  const setPages = (pages: GuidePage[]) => change({ pages })
  const updatePage = (pi: number, blocks: GuideBlock[]) => setPages(guide.pages.map((p, i) => (i === pi ? { ...p, blocks } : p)))
  const move = <T,>(arr: T[], from: number, to: number) => {
    const n = [...arr]
    const [x] = n.splice(from, 1)
    n.splice(to, 0, x)
    return n
  }

  const save = async (status?: StudyGuide['status']) => {
    if (!guide.title.trim()) return notify({ tone: 'error', title: 'Add a title first' })
    setSaving(true)
    try {
      const payload = { ...guide, status: status ?? guide.status ?? 'draft', pages: clean(guide.pages) }
      delete (payload as Partial<GuideRecord>).id
      const saved = id ? await guideService.update(id, payload) : await guideService.create(payload)
      setGuide(saved as StudyGuide)
      setDirty(false)
      notify({ tone: 'success', title: status === 'published' ? 'Guide published' : 'Guide saved', message: status === 'published' ? `Live at /guides/${(saved as StudyGuide).slug}` : undefined })
      if (!id) navigate(`/admin/guides/${(saved as GuideRecord).id}/edit`, { replace: true })
    } catch (e) {
      notify({ tone: 'error', title: 'Save failed', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const imageOptions = Object.keys(imageManifest).map((k) => ({ value: k, label: labelize(k) }))
  const coverIsBuiltIn = !guide.coverImage || guide.coverImage in imageManifest

  return (
    <>
      <PageHeader
        back={{ to: '/admin/guides', label: 'Study guides' }}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {guide.title || 'Untitled guide'} <StatusBadge status={guide.status ?? 'draft'} /> {dirty ? <span className="text-sm font-normal text-amber-700">Unsaved changes</span> : null}
          </span>
        }
        description={GUIDE_KIND_LABEL[guide.kind]}
        actions={
          canWrite ? (
            <>
              {id ? <Button variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}>Delete</Button> : null}
              {guide.status === 'published' && guide.slug ? <Button icon="arrowUpRight" onClick={() => window.open(`/guides/${guide.slug}`, '_blank', 'noopener')}>View live</Button> : null}
              <Button onClick={() => save()} loading={saving}>Save draft</Button>
              <Button variant="primary" onClick={() => save('published')} loading={saving}>{guide.status === 'published' ? 'Update live guide' : 'Publish'}</Button>
            </>
          ) : null
        }
      />
      <Tabs tabs={[{ value: 'edit', label: 'Edit' }, { value: 'preview', label: 'Preview' }]} value={tab} onChange={setTab} />

      {tab === 'preview' ? (
        <div className="mt-6 rounded-xl bg-[#efe9df] p-4 sm:p-8">
          <GuideDocument guide={{ ...guide, pages: clean(guide.pages) }} />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <Card title="Guide details">
              <div className="grid gap-4">
                <TextField label="Title" required value={guide.title} disabled={!canWrite} onChange={(e) => change({ title: e.target.value })} />
                <SelectField label="Type" value={guide.kind} disabled={!canWrite} onChange={(e) => change({ kind: e.target.value as GuideKind })} options={KINDS} />
                <TextField label="Series (cover label)" value={guide.series ?? ''} disabled={!canWrite} onChange={(e) => change({ series: e.target.value })} placeholder="Global Harvest Bible Study" />
                <TextField label="Subtitle" value={guide.subtitle ?? ''} disabled={!canWrite} onChange={(e) => change({ subtitle: e.target.value })} />
                <TextAreaField label="Summary" rows={3} value={guide.summary ?? ''} disabled={!canWrite} onChange={(e) => change({ summary: e.target.value })} hint="Shown on the guide card." />
                <TextField label="Author" value={guide.author ?? ''} disabled={!canWrite} onChange={(e) => change({ author: e.target.value })} />
                <SelectField label="Cover photo" value={coverIsBuiltIn ? guide.coverImage ?? '' : ''} disabled={!canWrite} onChange={(e) => change({ coverImage: e.target.value })} options={imageOptions} placeholder="Custom URL (below)" />
                {!coverIsBuiltIn || guide.coverImage === '' ? <TextField label="Cover image URL" type="url" value={coverIsBuiltIn ? '' : guide.coverImage ?? ''} disabled={!canWrite} onChange={(e) => change({ coverImage: e.target.value })} hint="Paste a URL from the Media library." /> : null}
                {studies.data?.items.length ? (
                  <SelectField label="Related Bible study" value={guide.bibleStudyId ?? ''} disabled={!canWrite} onChange={(e) => change({ bibleStudyId: e.target.value || undefined })} options={studies.data.items.map((s) => ({ value: s.id, label: s.title }))} placeholder="None" />
                ) : null}
                {guide.slug ? <p className="text-xs text-teal-900/55">Public address: <code>/guides/{guide.slug}</code></p> : null}
              </div>
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <p className="flex items-center gap-2 text-sm text-teal-900/60">
              <Icon name="book" size={16} /> The cover is generated from the details. Pages below appear two to a spread (page 1 sits opposite the cover).
            </p>
            {guide.pages.map((page, pi) => (
              <Card
                key={page.id}
                title={`Page ${pi + 1}`}
                actions={
                  canWrite ? (
                    <span className="flex">
                      <IconButton icon="chevronUp" label="Move page up" disabled={pi === 0} onClick={() => setPages(move(guide.pages, pi, pi - 1))} />
                      <IconButton icon="chevronDown" label="Move page down" disabled={pi === guide.pages.length - 1} onClick={() => setPages(move(guide.pages, pi, pi + 1))} />
                      <IconButton icon="trash" label="Delete page" onClick={() => setPages(guide.pages.filter((_, i) => i !== pi))} />
                    </span>
                  ) : null
                }
              >
                <ol className="space-y-4">
                  {page.blocks.map((block, bi) => (
                    <li key={block.id} className="rounded-lg bg-cream-50/70 p-4 ring-1 ring-teal-900/8">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold tracking-wide text-teal-900/55 uppercase">{BLOCKS[block.type].label}</span>
                        {canWrite ? (
                          <span className="flex">
                            <IconButton icon="chevronUp" label="Move block up" disabled={bi === 0} onClick={() => updatePage(pi, move(page.blocks, bi, bi - 1))} />
                            <IconButton icon="chevronDown" label="Move block down" disabled={bi === page.blocks.length - 1} onClick={() => updatePage(pi, move(page.blocks, bi, bi + 1))} />
                            <IconButton icon="trash" label="Remove block" onClick={() => updatePage(pi, page.blocks.filter((_, i) => i !== bi))} />
                          </span>
                        ) : null}
                      </div>
                      <fieldset disabled={!canWrite}>
                        <BlockEditor block={block} onChange={(nb) => updatePage(pi, page.blocks.map((x, i) => (i === bi ? nb : x)))} />
                      </fieldset>
                    </li>
                  ))}
                </ol>
                {canWrite ? (
                  <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-dashed border-teal-900/15 pt-4">
                    <SelectField label="Add to this page" value={newType} onChange={(e) => setNewType(e.target.value as GuideBlockType)} options={Object.entries(BLOCKS).map(([v, m]) => ({ value: v, label: m.label }))} />
                    <Button icon="plus" onClick={() => updatePage(pi, [...page.blocks, b(newType, newType === 'questions' ? { items: [''], lines: 3, start: 1 } : newType === 'points' ? { items: [''] } : {})])}>Add block</Button>
                  </div>
                ) : null}
              </Card>
            ))}
            {canWrite ? (
              <Button icon="plus" onClick={() => setPages([...guide.pages, { id: uid(), blocks: [b('exercise', { text: `Exercise ${guide.pages.length}` })] }])}>
                Add page
              </Button>
            ) : null}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        danger
        title="Delete this guide?"
        body="It will be removed from the website immediately. Readers’ private notes on their own devices are unaffected."
        confirmLabel="Delete guide"
        onConfirm={async () => {
          if (!id) return
          await guideService.remove(id)
          notify({ tone: 'success', title: 'Guide deleted' })
          navigate('/admin/guides')
        }}
      />
    </>
  )
}
