import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { StatCard } from '../components/Charts'
import { DataTable, type Column } from '../components/DataTable'
import { RecordForm, type FormSectionConfig } from '../components/RecordForm'
import { Button, Card, ConfirmDialog, DemoTag, DetailList, ErrorState, FilterSelect, LoadingBlock, PageHeader, SearchInput, StatusBadge } from '../components/ui'
import { formatDateTime, formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { eventService } from '../services'
import type { Attendance, EventRecord, EventRegistrationRow } from '../types'

export const EVENT_STATUSES = ['draft', 'published', 'registration-open', 'registration-closed', 'completed', 'cancelled'] as const
const CATEGORIES = [
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'community', label: 'Community' },
  { value: 'mission', label: 'Mission' },
  { value: 'special', label: 'Special event' },
]
const FORMATS = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In person' },
  { value: 'both', label: 'Online & in person' },
]
const ATTENDANCE: Attendance[] = ['registered', 'confirmed', 'attended', 'no-show', 'cancelled']

const eventForm: FormSectionConfig[] = [
  {
    title: 'Event details',
    fields: [
      { name: 'title', label: 'Title', required: true, wide: true },
      { name: 'slug', label: 'URL slug', hint: 'Leave blank to generate from the title. Public page: /events/<slug>' },
      { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES },
      { name: 'summary', label: 'Short summary', wide: true, hint: 'Shown on event cards (1–2 sentences).' },
      { name: 'description', label: 'Description', type: 'textarea', hint: 'Separate paragraphs with a blank line.' },
      { name: 'coverImage', label: 'Cover image URL', type: 'url', wide: true, hint: 'Copy a URL from the Media library.' },
      { name: 'speaker', label: 'Speaker' },
    ],
  },
  {
    title: 'Date & place',
    fields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'timezone', label: 'Time zone', placeholder: 'e.g. EAT, GMT, EST' },
      { name: 'startTime', label: 'Start time', type: 'time', required: true },
      { name: 'endTime', label: 'End time', type: 'time' },
      { name: 'format', label: 'Format', type: 'select', required: true, options: FORMATS },
      { name: 'location', label: 'Location', required: true, placeholder: 'Venue name & city, or “Online”' },
      { name: 'meetingUrl', label: 'Meeting URL', type: 'url', wide: true, when: (v) => v.format !== 'in-person', hint: 'Only sent to registered attendees — not shown publicly.' },
    ],
  },
  {
    title: 'Registration & publishing',
    fields: [
      { name: 'registrationEnabled', label: 'Registration enabled', type: 'toggle', hint: 'Accept registrations on the public event page.' },
      { name: 'capacity', label: 'Capacity', type: 'number', hint: 'Leave blank for unlimited.' },
      { name: 'registrationDeadline', label: 'Registration deadline', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: EVENT_STATUSES.map((s) => ({ value: s, label: labelize(s) })), hint: 'Only “Registration open” accepts sign-ups. Draft events are hidden from the website.' },
    ],
  },
]

export default function Events() {
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { state, update, query } = useListState(['status', 'category'], { sort: 'date' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => eventService.list(query), [JSON.stringify(query)])
  const [toDelete, setToDelete] = useState<EventRecord | null>(null)

  const columns: Column<EventRecord>[] = [
    { key: 'title', header: 'Event', sortable: true, render: (e) => <span className="inline-flex items-center gap-2">{e.title} {e.isDemo ? <DemoTag /> : null}</span> },
    { key: 'date', header: 'Date', sortable: true, render: (e) => <span className="whitespace-nowrap">{formatDay(e.date)} · {e.startTime}</span>, mobile: true },
    { key: 'category', header: 'Category', render: (e) => CATEGORIES.find((c) => c.value === e.category)?.label ?? '—', optional: true },
    { key: 'format', header: 'Format', render: (e) => FORMATS.find((f) => f.value === e.format)?.label ?? '—' },
    { key: 'capacity', header: 'Capacity', render: (e) => e.capacity ?? '∞', optional: true },
    { key: 'status', header: 'Status', sortable: true, render: (e) => <StatusBadge status={e.status} />, mobile: true },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (e) => (
        <span className="inline-flex gap-1">
          <Button size="sm" variant="ghost" to={`/admin/events/${e.id}/registrations`}>Registrations</Button>
          {can('events:write') ? (
            <>
              <Button size="sm" variant="ghost" icon="copy" aria-label={`Duplicate ${e.title}`} onClick={async () => {
                const copy = await eventService.duplicate(e.id)
                notify({ tone: 'success', title: 'Event duplicated', message: 'The copy is a draft.' })
                navigate(`/admin/events/${copy.id}/edit`)
              }} />
              <Button size="sm" variant="ghost" icon="trash" aria-label={`Delete ${e.title}`} onClick={() => setToDelete(e)} />
            </>
          ) : null}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Events" description="Create and publish events. Published events appear on the public Events page." actions={can('events:write') ? <Button variant="primary" icon="plus" to="/admin/events/new">Create event</Button> : null} />
      <DataTable
        what="events"
        storageKey="events"
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
        rowHref={(e) => `/admin/events/${e.id}`}
        empty={{ title: 'No events yet.', body: 'Create your first event to start taking registrations.', action: can('events:write') ? <Button variant="primary" icon="plus" to="/admin/events/new">Create event</Button> : undefined }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search events…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={EVENT_STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
            <FilterSelect label="Category" value={state.filters.category} onChange={(v) => update({ filters: { category: v } })} options={CATEGORIES} />
          </>
        }
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        danger
        title="Delete event?"
        body={<>This permanently deletes <strong>{toDelete?.title}</strong>. Existing registrations are kept for your records.</>}
        confirmLabel="Delete event"
        onConfirm={async () => {
          if (!toDelete) return
          await eventService.remove(toDelete.id)
          setToDelete(null)
          notify({ tone: 'success', title: 'Event deleted' })
          reload()
        }}
      />
    </>
  )
}

export function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const existing = useResource(() => (id ? eventService.get(id) : Promise.resolve(null)), [id])
  if (id && existing.error) return <Card><ErrorState error={existing.error} onRetry={existing.reload} what="this event" /></Card>
  if (id && !existing.data) return <Card><LoadingBlock /></Card>
  const initial = existing.data ?? { status: 'draft', category: 'bible-study', format: 'in-person', registrationEnabled: true, startTime: '18:30' }
  return (
    <>
      <PageHeader back={{ to: id ? `/admin/events/${id}` : '/admin/events', label: id ? 'Event' : 'Events' }} title={id ? `Edit: ${existing.data?.title}` : 'Create event'} />
      <div className="max-w-4xl">
        <RecordForm
          sections={eventForm}
          initial={initial as Record<string, unknown>}
          submitLabel={id ? 'Save changes' : 'Create event'}
          onCancel={() => navigate(-1)}
          onSubmit={async (values) => {
            const saved = id ? await eventService.update(id, values as Partial<EventRecord>) : await eventService.create(values as Partial<EventRecord>)
            notify({ tone: 'success', title: id ? 'Event saved' : 'Event created' })
            navigate(`/admin/events/${saved.id}`)
          }}
        />
      </div>
    </>
  )
}

export function EventDetail() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { notify } = useToast()
  const { data: event, setData, loading, error, reload } = useResource(() => eventService.get(id), [id])
  const regs = useResource(() => (event ? eventService.registrations(event.slug, { pageSize: 5 }) : Promise.resolve(null)), [event?.slug])
  if (error) return <Card><ErrorState error={error} onRetry={reload} what="this event" /></Card>
  if (loading || !event) return <Card><LoadingBlock /></Card>
  const stats = regs.data?.stats
  const remaining = event.capacity && stats ? Math.max(0, event.capacity - stats.people) : null
  const publish = async (status: EventRecord['status']) => {
    const updated = await eventService.update(event.id, { status })
    setData(updated)
    notify({ tone: 'success', title: `Event ${labelize(status).toLowerCase()}` })
  }
  const isLive = event.status !== 'draft' && event.status !== 'cancelled'
  return (
    <>
      <PageHeader
        back={{ to: '/admin/events', label: 'Events' }}
        title={<span className="inline-flex flex-wrap items-center gap-3">{event.title} <StatusBadge status={event.status} /> {event.isDemo ? <DemoTag /> : null}</span>}
        description={`${formatDay(event.date)} · ${event.startTime}${event.endTime ? `–${event.endTime}` : ''} ${event.timezone ?? ''} · ${event.location}`}
        actions={
          <>
            {isLive ? <Button icon="arrowUpRight" onClick={() => window.open(`/events/${event.slug}`, '_blank', 'noopener')}>View public page</Button> : null}
            {can('events:write') ? (
              <>
                {event.status === 'draft' ? <Button variant="accent" onClick={() => publish('registration-open')}>Publish & open registration</Button> : isLive ? <Button onClick={() => publish('draft')}>Unpublish</Button> : null}
                <Button variant="primary" icon="edit" to={`/admin/events/${event.id}/edit`}>Edit</Button>
              </>
            ) : null}
          </>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Event figures">
        <StatCard label="Registrations" value={stats?.registrations ?? 0} hint="Excluding cancelled" />
        <StatCard label="People attending" value={stats?.people ?? 0} hint="Sum of attendees" />
        <StatCard label="Capacity" value={event.capacity ?? '∞'} hint={event.capacity ? 'Maximum places' : 'No limit set'} />
        <StatCard label="Remaining spaces" value={remaining ?? '—'} hint={stats ? `${stats.attended} marked attended` : undefined} />
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Details" className="xl:col-span-2">
          <DetailList
            items={[
              { label: 'Summary', value: event.summary },
              { label: 'Category', value: labelize(event.category ?? '') },
              { label: 'Format', value: labelize(event.format) },
              { label: 'Speaker', value: event.speaker },
              { label: 'Meeting URL', value: event.meetingUrl ? <a className="text-teal-700 hover:underline" href={event.meetingUrl} target="_blank" rel="noreferrer">{event.meetingUrl}</a> : null },
              { label: 'Registration', value: event.registrationEnabled ? `Enabled${event.registrationDeadline ? ` until ${formatDay(event.registrationDeadline)}` : ''}` : 'Disabled' },
              { label: 'Public URL', value: `/events/${event.slug}` },
              { label: 'Last updated', value: formatDateTime(event.updatedAt) },
            ]}
          />
          {event.description ? <p className="mt-5 border-t border-teal-900/8 pt-4 text-sm whitespace-pre-wrap text-teal-900/80">{event.description}</p> : null}
        </Card>
        <Card title="Latest registrations" padded={false} actions={<Button size="sm" variant="ghost" to={`/admin/events/${event.id}/registrations`}>View all</Button>}>
          {regs.data?.items.length ? (
            <ul className="divide-y divide-teal-900/[0.06]">
              {regs.data.items.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span className="min-w-0 truncate text-teal-900">{r.firstName} {r.lastName} <span className="text-teal-900/50">· {r.attendees}</span></span>
                  <StatusBadge status={r.attendance} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-teal-900/55">No registrations yet.</p>
          )}
        </Card>
      </div>
    </>
  )
}

export function EventRegistrations() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { notify } = useToast()
  const event = useResource(() => eventService.get(id), [id])
  const { state, update, query } = useListState(['attendance'], { sort: 'createdAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const slug = event.data?.slug
  const { data, loading, error, reload } = useResource(() => (slug ? eventService.registrations(slug, query) : new Promise<never>(() => undefined)), [slug, JSON.stringify(query)])

  const setOne = async (r: EventRegistrationRow, attendance: Attendance) => {
    try {
      await eventService.setAttendance(r.id, attendance)
      reload()
    } catch (e) {
      notify({ tone: 'error', title: 'Update failed', message: (e as Error).message })
    }
  }

  const columns: Column<EventRegistrationRow>[] = [
    { key: 'name', header: 'Participant', sortable: true, render: (r) => <span className="inline-flex items-center gap-2">{r.firstName} {r.lastName} {r.isDemo ? <DemoTag /> : null}</span> },
    { key: 'email', header: 'Email', sortable: true, render: (r) => <a className="text-teal-700 hover:underline" href={`mailto:${r.email}`}>{r.email}</a>, mobile: true },
    { key: 'phone', header: 'Phone', render: (r) => r.phone },
    { key: 'createdAt', header: 'Registered', sortable: true, render: (r) => formatDay(r.createdAt), mobile: true },
    { key: 'attendees', header: 'Attending', sortable: true, render: (r) => r.attendees, mobile: true },
    { key: 'special', header: 'Requirements', render: (r) => r.specialRequirements ?? '—', optional: true },
    {
      key: 'attendance',
      header: 'Attendance',
      sortable: true,
      render: (r) =>
        can('event_registrations:write') ? (
          <select aria-label={`Attendance for ${r.firstName} ${r.lastName}`} value={r.attendance} onChange={(e) => setOne(r, e.target.value as Attendance)} className="h-8 rounded-lg border-0 bg-white px-2 text-sm ring-1 ring-teal-900/15">
            {ATTENDANCE.map((a) => <option key={a} value={a}>{labelize(a)}</option>)}
          </select>
        ) : (
          <StatusBadge status={r.attendance} />
        ),
    },
  ]

  return (
    <>
      <PageHeader
        back={{ to: `/admin/events/${id}`, label: event.data?.title ?? 'Event' }}
        title="Event registrations"
        description={event.data ? `${event.data.title} · ${formatDay(event.data.date)}` : undefined}
        actions={slug ? <Button icon="download" onClick={() => eventService.exportCsv(slug, query).catch((e) => notify({ tone: 'error', title: 'Export failed', message: e.message }))}>Export CSV</Button> : null}
      >
        {data?.stats ? (
          <p className="mt-3 text-sm text-teal-900/70">
            <strong className="text-teal-900">{data.stats.registrations}</strong> registrations · <strong className="text-teal-900">{data.stats.people}</strong> people · <strong className="text-teal-900">{data.stats.attended}</strong> attended
            {event.data?.capacity ? <> · capacity {event.data.capacity}</> : null}
          </p>
        ) : null}
      </PageHeader>
      <DataTable
        what="event registrations"
        storageKey="event-registrations"
        columns={columns}
        rows={data?.items ?? null}
        total={data?.total}
        loading={loading || event.loading}
        error={error ?? event.error}
        onRetry={reload}
        page={state.page}
        pageSize={state.pageSize}
        onPage={(page) => update({ page }, false)}
        sort={state.sort}
        dir={state.dir}
        onSort={(sort, dir) => update({ sort, dir })}
        selectable={can('event_registrations:write')}
        bulkActions={(ids, clear) => (
          <>
            {(['confirmed', 'attended', 'no-show', 'cancelled'] as Attendance[]).map((a) => (
              <Button key={a} size="sm" onClick={async () => { await eventService.bulkAttendance(ids, a); notify({ tone: 'success', title: `Marked ${ids.length} as ${labelize(a).toLowerCase()}` }); clear(); reload() }}>
                Mark {labelize(a).toLowerCase()}
              </Button>
            ))}
          </>
        )}
        empty={{ title: 'No registrations for this event yet.', body: event.data?.status === 'registration-open' ? 'Share the public event page to start receiving registrations.' : 'Open registration to start receiving sign-ups.', action: event.data ? <Link className="text-sm font-medium text-teal-700 hover:underline" to={`/events/${event.data.slug}`} target="_blank">Open public event page</Link> : undefined }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search participants…" className="w-full sm:w-64" />
            <FilterSelect label="Attendance" value={state.filters.attendance} onChange={(v) => update({ filters: { attendance: v } })} options={ATTENDANCE.map((a) => ({ value: a, label: labelize(a) }))} />
          </>
        }
      />
    </>
  )
}
