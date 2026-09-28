import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { RecordForm, type FormSectionConfig } from '../components/RecordForm'
import { Button, Card, ConfirmDialog, DemoTag, DetailList, ErrorState, FilterSelect, IconButton, LoadingBlock, PageHeader, SearchInput, StatusBadge, TextAreaField, TextField } from '../components/ui'
import { formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { bibleStudyService, guideService, memberService } from '../services'
import type { BibleStudyRecord, BibleStudySession } from '../types'

const STATUSES = ['draft', 'open', 'active', 'completed', 'archived'] as const
const TYPES = [
  { value: 'book', label: 'Book study' },
  { value: 'topical', label: 'Topical series' },
  { value: 'course', label: 'Course' },
  { value: 'devotional', label: 'Devotional' },
]
const FORMATS = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In person' },
  { value: 'both', label: 'Online & in person' },
]

const studyForm: FormSectionConfig[] = [
  {
    title: 'Study',
    fields: [
      { name: 'title', label: 'Title', required: true, wide: true },
      { name: 'studyType', label: 'Study type', type: 'select', required: true, options: TYPES },
      { name: 'leader', label: 'Leader' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'coverImage', label: 'Cover image URL', type: 'url', wide: true },
    ],
  },
  {
    title: 'Schedule & meeting',
    fields: [
      { name: 'schedule', label: 'Schedule', placeholder: 'e.g. Tuesdays 7:00 PM EAT', wide: true },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'format', label: 'Meeting format', type: 'select', required: true, options: FORMATS },
      { name: 'location', label: 'Meeting location', when: (v) => v.format !== 'online' },
      { name: 'meetingLink', label: 'Meeting link', type: 'url', wide: true, when: (v) => v.format !== 'in-person' },
    ],
  },
  {
    title: 'Enrolment',
    fields: [
      { name: 'maxParticipants', label: 'Maximum participants', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map((s) => ({ value: s, label: labelize(s) })) },
      { name: 'registrationEnabled', label: 'Registration enabled', type: 'toggle', hint: 'People can register interest for this study.' },
    ],
  },
]

function SessionsEditor({ sessions, onChange }: { sessions: BibleStudySession[]; onChange: (s: BibleStudySession[]) => void }) {
  const upd = (i: number, patch: Partial<BibleStudySession>) => onChange(sessions.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const move = (i: number, d: -1 | 1) => {
    const n = [...sessions]
    const [x] = n.splice(i, 1)
    n.splice(i + d, 0, x)
    onChange(n)
  }
  return (
    <Card title={`Sessions (${sessions.length})`} actions={<Button size="sm" icon="plus" onClick={() => onChange([...sessions, { id: crypto.randomUUID(), title: `Week ${sessions.length + 1} — ` }])}>Add session</Button>}>
      {sessions.length ? (
        <ol className="space-y-4">
          {sessions.map((s, i) => (
            <li key={s.id} className="rounded-xl bg-cream-50/60 p-4 ring-1 ring-teal-900/8">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-teal-900/55 uppercase">Session {i + 1}</span>
                <span className="flex">
                  <IconButton icon="chevronUp" label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton icon="chevronDown" label="Move down" disabled={i === sessions.length - 1} onClick={() => move(i, 1)} />
                  <IconButton icon="trash" label="Remove session" onClick={() => onChange(sessions.filter((_, j) => j !== i))} />
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Session title" value={s.title} onChange={(e) => upd(i, { title: e.target.value })} className="sm:col-span-2" />
                <TextField label="Date" type="date" value={s.date ?? ''} onChange={(e) => upd(i, { date: e.target.value })} />
                <TextField label="Time" type="time" value={s.time ?? ''} onChange={(e) => upd(i, { time: e.target.value })} />
                <TextField label="Bible references" value={s.references ?? ''} onChange={(e) => upd(i, { references: e.target.value })} placeholder="e.g. Mark 1:1–15" />
                <TextField label="Meeting link" type="url" value={s.meetingLink ?? ''} onChange={(e) => upd(i, { meetingLink: e.target.value })} />
                <TextAreaField label="Description" rows={2} value={s.description ?? ''} onChange={(e) => upd(i, { description: e.target.value })} className="sm:col-span-2" />
                <TextAreaField label="Study notes" rows={3} value={s.notes ?? ''} onChange={(e) => upd(i, { notes: e.target.value })} className="sm:col-span-2" />
                <TextField label="Resources" value={s.resources ?? ''} onChange={(e) => upd(i, { resources: e.target.value })} placeholder="Links or titles, comma separated" className="sm:col-span-2" />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-teal-900/55">No sessions yet. Add weekly sessions with references, notes and links.</p>
      )}
    </Card>
  )
}

export default function BibleStudies() {
  const { can } = useAuth()
  const { state, update, query } = useListState(['status', 'format'], { sort: 'updatedAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => bibleStudyService.list(query), [JSON.stringify(query)])
  const columns: Column<BibleStudyRecord>[] = [
    { key: 'title', header: 'Study', sortable: true, render: (s) => <span className="inline-flex items-center gap-2">{s.title} {s.isDemo ? <DemoTag /> : null}</span> },
    { key: 'leader', header: 'Leader', render: (s) => s.leader ?? '—', mobile: true },
    { key: 'schedule', header: 'Schedule', render: (s) => s.schedule ?? '—' },
    { key: 'format', header: 'Format', render: (s) => labelize(s.format ?? '') },
    { key: 'sessions', header: 'Sessions', render: (s) => s.sessions?.length ?? 0 },
    { key: 'startDate', header: 'Starts', sortable: true, render: (s) => formatDay(s.startDate), optional: true },
    { key: 'status', header: 'Status', sortable: true, render: (s) => <StatusBadge status={s.status} />, mobile: true },
  ]
  return (
    <>
      <PageHeader title="Bible Studies" description="Create studies, plan weekly sessions and manage participants." actions={can('bible_studies:write') ? <Button variant="primary" icon="plus" to="/admin/bible-studies/new">New Bible study</Button> : null} />
      <DataTable
        what="Bible studies"
        storageKey="studies"
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
        rowHref={(s) => `/admin/bible-studies/${s.id}`}
        empty={{ title: 'No Bible studies yet.', body: 'Create a study and add its weekly sessions.', action: can('bible_studies:write') ? <Button variant="primary" icon="plus" to="/admin/bible-studies/new">New Bible study</Button> : undefined }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search studies…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
            <FilterSelect label="Format" value={state.filters.format} onChange={(v) => update({ filters: { format: v } })} options={FORMATS} />
          </>
        }
      />
    </>
  )
}

export function BibleStudyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const existing = useResource(() => (id ? bibleStudyService.get(id) : Promise.resolve(null)), [id])
  if (id && existing.error) return <Card><ErrorState error={existing.error} onRetry={existing.reload} /></Card>
  if (id && !existing.data) return <Card><LoadingBlock /></Card>
  const initial = existing.data ?? { status: 'draft', studyType: 'book', format: 'online', registrationEnabled: true, sessions: [] }
  return (
    <>
      <PageHeader back={{ to: id ? `/admin/bible-studies/${id}` : '/admin/bible-studies', label: id ? 'Study' : 'Bible Studies' }} title={id ? `Edit: ${existing.data?.title}` : 'New Bible study'} />
      <div className="max-w-4xl">
        <RecordForm
          sections={studyForm}
          initial={initial as Record<string, unknown>}
          submitLabel={id ? 'Save changes' : 'Create study'}
          onCancel={() => navigate(-1)}
          extra={(values, set) => <SessionsEditor sessions={(values.sessions as BibleStudySession[]) ?? []} onChange={(s) => set('sessions', s)} />}
          onSubmit={async (values) => {
            const saved = id ? await bibleStudyService.update(id, values as Partial<BibleStudyRecord>) : await bibleStudyService.create(values as Partial<BibleStudyRecord>)
            notify({ tone: 'success', title: id ? 'Study saved' : 'Study created' })
            navigate(`/admin/bible-studies/${saved.id}`)
          }}
        />
      </div>
    </>
  )
}

export function BibleStudyDetail() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { data: s, loading, error, reload } = useResource(() => bibleStudyService.get(id), [id])
  const participants = useResource(() => (can('members:read') ? memberService.list({ pageSize: 100, q: id }) : Promise.resolve(null)), [id])
  const [confirm, setConfirm] = useState(false)
  const guides = useResource(() => (can('guides:read') ? guideService.list({ pageSize: 50, q: id }) : Promise.resolve(null)), [id])
  if (error) return <Card><ErrorState error={error} onRetry={reload} /></Card>
  if (loading || !s) return <Card><LoadingBlock /></Card>
  const linkedGuides = (guides.data?.items ?? []).filter((g) => g.bibleStudyId === s.id)
  const enrolled = (participants.data?.items ?? []).filter((m) => m.bibleStudyIds?.includes(s.id))
  return (
    <>
      <PageHeader
        back={{ to: '/admin/bible-studies', label: 'Bible Studies' }}
        title={<span className="inline-flex flex-wrap items-center gap-3">{s.title} <StatusBadge status={s.status} /> {s.isDemo ? <DemoTag /> : null}</span>}
        description={[s.schedule, s.leader && `Led by ${s.leader}`].filter(Boolean).join(' · ')}
        actions={
          can('bible_studies:write') ? (
            <>
              <Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>Delete</Button>
              <Button variant="primary" icon="edit" to={`/admin/bible-studies/${s.id}/edit`}>Edit & sessions</Button>
            </>
          ) : null
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Overview">
            <DetailList
              items={[
                { label: 'Type', value: TYPES.find((t) => t.value === s.studyType)?.label },
                { label: 'Format', value: labelize(s.format ?? '') },
                { label: 'Dates', value: s.startDate ? `${formatDay(s.startDate)} – ${formatDay(s.endDate)}` : null },
                { label: 'Location', value: s.location },
                { label: 'Meeting link', value: s.meetingLink ? <a className="text-teal-700 hover:underline" href={s.meetingLink} target="_blank" rel="noreferrer">{s.meetingLink}</a> : null },
                { label: 'Max participants', value: s.maxParticipants },
              ]}
            />
            {s.description ? <p className="mt-5 border-t border-teal-900/8 pt-4 text-sm whitespace-pre-wrap text-teal-900/80">{s.description}</p> : null}
          </Card>
          <Card title={`Sessions (${s.sessions?.length ?? 0})`} padded={false}>
            {s.sessions?.length ? (
              <ol className="divide-y divide-teal-900/[0.06]">
                {s.sessions.map((x, i) => (
                  <li key={x.id} className="flex gap-4 px-5 py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-800 text-sm font-semibold text-white">{i + 1}</span>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-teal-900">{x.title}</p>
                      <p className="text-teal-900/60">{[x.date && formatDay(x.date), x.time, x.references].filter(Boolean).join(' · ')}</p>
                      {x.description ? <p className="mt-1 text-teal-900/75">{x.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="p-5 text-sm text-teal-900/55">No sessions planned yet.</p>
            )}
          </Card>
        </div>
        <div className="space-y-6">
        <Card title="Study guides" actions={can('guides:write') ? <Button size="sm" icon="plus" to="/admin/guides/new?kind=bible-study">New guide</Button> : null}>
          {linkedGuides.length ? (
            <ul className="space-y-2 text-sm">{linkedGuides.map((g) => <li key={g.id} className="flex items-center justify-between gap-2"><Link className="text-teal-800 hover:underline" to={`/admin/guides/${g.id}/edit`}>{g.title}</Link><StatusBadge status={g.status ?? 'draft'} /></li>)}</ul>
          ) : (
            <p className="text-sm text-teal-900/55">No study guide linked yet. Create one and choose this study under “Related Bible study”.</p>
          )}
        </Card>
        <Card title={`Participants (${enrolled.length})`}>
          {enrolled.length ? (
            <ul className="space-y-2 text-sm">{enrolled.map((m) => <li key={m.id}><Link className="text-teal-800 hover:underline" to={`/admin/members/${m.id}`}>{m.firstName} {m.lastName}</Link></li>)}</ul>
          ) : (
            <p className="text-sm text-teal-900/55">No members enrolled yet. Enrol members from their profile page.</p>
          )}
        </Card>
        </div>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} danger title="Delete Bible study?" body="This deletes the study and all its sessions." confirmLabel="Delete" onConfirm={async () => { await bibleStudyService.remove(s.id); notify({ tone: 'success', title: 'Study deleted' }); navigate('/admin/bible-studies') }} />
    </>
  )
}
