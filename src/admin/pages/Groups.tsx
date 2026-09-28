import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { countryOptions } from '../../content/formOptions'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { NotesPanel } from '../components/NotesPanel'
import { RecordForm, type FormSectionConfig } from '../components/RecordForm'
import { Button, Card, ConfirmDialog, DemoTag, DetailList, Drawer, ErrorState, FilterSelect, LoadingBlock, PageHeader, SearchInput, StatusBadge } from '../components/ui'
import { labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { api } from '../api/client'
import { groupService, memberService } from '../services'
import type { AdminNote, GroupRecord } from '../types'

const STATUSES = ['active', 'inactive', 'full'] as const
const TYPES = ['bible-study', 'prayer', 'young-adults', 'men', 'women', 'mission', 'other'].map((v) => ({ value: v, label: labelize(v) }))
const FORMATS = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In person' },
  { value: 'both', label: 'Online & in person' },
]

const groupForm: FormSectionConfig[] = [
  {
    title: 'Group',
    fields: [
      { name: 'name', label: 'Name', required: true, wide: true },
      { name: 'groupType', label: 'Type', type: 'select', required: true, options: TYPES },
      { name: 'leader', label: 'Leader' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    title: 'Meeting',
    fields: [
      { name: 'format', label: 'Meeting format', type: 'select', required: true, options: FORMATS },
      { name: 'schedule', label: 'Meeting schedule', placeholder: 'e.g. Fridays 6:30 PM' },
      { name: 'country', label: 'Country', type: 'select', options: countryOptions() },
      { name: 'city', label: 'City' },
      { name: 'capacity', label: 'Capacity', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map((s) => ({ value: s, label: labelize(s) })) },
    ],
  },
]

export default function Groups() {
  const { can } = useAuth()
  const { state, update, query } = useListState(['status', 'groupType', 'country'], { sort: 'name', dir: 'asc' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => groupService.list(query), [JSON.stringify(query)])
  const columns: Column<GroupRecord>[] = [
    { key: 'name', header: 'Group', sortable: true, render: (g) => <span className="inline-flex items-center gap-2">{g.name} {g.isDemo ? <DemoTag /> : null}</span> },
    { key: 'groupType', header: 'Type', render: (g) => labelize(g.groupType ?? ''), mobile: true },
    { key: 'leader', header: 'Leader', render: (g) => g.leader ?? '—' },
    { key: 'location', header: 'Location', render: (g) => [g.city, g.country].filter(Boolean).join(', ') || labelize(g.format ?? ''), mobile: true },
    { key: 'schedule', header: 'Schedule', render: (g) => g.schedule ?? '—', optional: true },
    { key: 'capacity', header: 'Capacity', render: (g) => g.capacity ?? '—', optional: true },
    { key: 'status', header: 'Status', sortable: true, render: (g) => <StatusBadge status={g.status} />, mobile: true },
  ]
  return (
    <>
      <PageHeader title="Groups" description="Bible study, prayer, young adults, men’s, women’s and mission groups." actions={can('groups:write') ? <Button variant="primary" icon="plus" to="/admin/groups/new">New group</Button> : null} />
      <DataTable
        what="groups"
        storageKey="groups"
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
        rowHref={(g) => `/admin/groups/${g.id}`}
        empty={{ title: 'No groups yet.', body: 'Create groups and assign members to them.', action: can('groups:write') ? <Button variant="primary" icon="plus" to="/admin/groups/new">New group</Button> : undefined }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search groups…" className="w-full sm:w-64" />
            <FilterSelect label="Type" value={state.filters.groupType} onChange={(v) => update({ filters: { groupType: v } })} options={TYPES} />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
          </>
        }
      />
    </>
  )
}

export function GroupFormPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  return (
    <>
      <PageHeader back={{ to: '/admin/groups', label: 'Groups' }} title="New group" />
      <div className="max-w-4xl">
        <RecordForm
          sections={groupForm}
          initial={{ status: 'active', groupType: 'bible-study', format: 'in-person' }}
          submitLabel="Create group"
          onCancel={() => navigate(-1)}
          onSubmit={async (values) => {
            const g = await groupService.create(values as Partial<GroupRecord>)
            notify({ tone: 'success', title: 'Group created' })
            navigate(`/admin/groups/${g.id}`)
          }}
        />
      </div>
    </>
  )
}

export function GroupDetail() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { data: g, setData, loading, error, reload } = useResource(() => groupService.get(id), [id])
  const members = useResource(() => (can('members:read') ? groupService.members(id) : Promise.resolve(null)), [id])
  const notes = useResource(() => api.get<{ notes: AdminNote[] }>(`/notes/group/${id}`).then((r) => r.notes), [id])
  const [editing, setEditing] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [q, setQ] = useState('')
  const candidates = useResource(() => (assigning ? memberService.list({ q, pageSize: 20 }) : Promise.resolve(null)), [assigning, q])
  const [confirm, setConfirm] = useState(false)
  if (error) return <Card><ErrorState error={error} onRetry={reload} /></Card>
  if (loading || !g) return <Card><LoadingBlock /></Card>
  const list = members.data?.items ?? []
  return (
    <>
      <PageHeader
        back={{ to: '/admin/groups', label: 'Groups' }}
        title={<span className="inline-flex flex-wrap items-center gap-3">{g.name} <StatusBadge status={g.status} /> {g.isDemo ? <DemoTag /> : null}</span>}
        description={labelize(g.groupType ?? '')}
        actions={
          can('groups:write') ? (
            <>
              <Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>Delete</Button>
              <Button icon="edit" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="primary" icon="plus" onClick={() => setAssigning(true)}>Assign members</Button>
            </>
          ) : null
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title={`Members (${list.length}${g.capacity ? ` / ${g.capacity}` : ''})`} padded={false}>
            {list.length ? (
              <ul className="divide-y divide-teal-900/[0.06]">
                {list.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <Link to={`/admin/members/${m.id}`} className="font-medium text-teal-900 hover:underline">{m.firstName} {m.lastName}</Link>
                    <span className="flex items-center gap-3">
                      <StatusBadge status={m.status} />
                      {can('groups:write') ? <button type="button" className="text-xs text-coral-700 hover:underline" onClick={async () => { await groupService.assign(g.id, m.id, 'remove'); members.reload() }}>Remove</button> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-teal-900/55">No members assigned yet.</p>
            )}
          </Card>
          <NotesPanel notes={notes.data ?? []} canWrite={can('groups:write')} kinds={['note']} onAdd={async (body) => { await api.post(`/notes/group/${g.id}`, { body }); notes.reload() }} />
        </div>
        <Card title="Details">
          <DetailList
            items={[
              { label: 'Leader', value: g.leader },
              { label: 'Schedule', value: g.schedule },
              { label: 'Format', value: labelize(g.format ?? '') },
              { label: 'Location', value: [g.city, g.country].filter(Boolean).join(', ') },
              { label: 'Capacity', value: g.capacity },
              { label: 'Description', value: g.description },
            ]}
          />
        </Card>
      </div>
      <Drawer open={editing} onClose={() => setEditing(false)} title="Edit group">
        <RecordForm sections={groupForm} initial={g as unknown as Record<string, unknown>} onCancel={() => setEditing(false)} onSubmit={async (v) => { setData(await groupService.update(g.id, v as Partial<GroupRecord>)); setEditing(false); notify({ tone: 'success', title: 'Group saved' }) }} />
      </Drawer>
      <Drawer open={assigning} onClose={() => setAssigning(false)} title="Assign members">
        <SearchInput value={q} onChange={setQ} placeholder="Search members…" />
        <ul className="mt-4 divide-y divide-teal-900/[0.06]">
          {(candidates.data?.items ?? []).map((m) => {
            const inGroup = m.groupIds?.includes(g.id)
            return (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>{m.firstName} {m.lastName} <span className="text-teal-900/50">· {m.email}</span></span>
                <Button size="sm" variant={inGroup ? 'ghost' : 'primary'} disabled={inGroup} onClick={async () => { await groupService.assign(g.id, m.id); candidates.reload(); members.reload(); notify({ tone: 'success', title: `${m.firstName} added to ${g.name}` }) }}>
                  {inGroup ? 'In group' : 'Add'}
                </Button>
              </li>
            )
          })}
        </ul>
        {candidates.data && !candidates.data.items.length ? <p className="mt-4 text-sm text-teal-900/55">No members found. Members are created from registrations or the Members page.</p> : null}
      </Drawer>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} danger title="Delete group?" body="Members stay in the system; only the group is removed." confirmLabel="Delete group" onConfirm={async () => { await groupService.remove(g.id); navigate('/admin/groups') }} />
    </>
  )
}
