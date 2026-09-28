import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { countryOptions } from '../../content/formOptions'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { NotesPanel } from '../components/NotesPanel'
import { RecordForm, type FormSectionConfig } from '../components/RecordForm'
import { Button, Card, ConfirmDialog, DemoTag, DetailList, Drawer, ErrorState, FilterSelect, LoadingBlock, PageHeader, SearchInput, SelectField, StatusBadge, Tag } from '../components/ui'
import { formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { bibleStudyService, groupService, memberService } from '../services'
import type { Member } from '../types'

const STATUSES = ['active', 'inactive', 'pending'] as const

export const memberForm: FormSectionConfig[] = [
  {
    title: 'Profile',
    fields: [
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone' },
      { name: 'country', label: 'Country', type: 'select', options: countryOptions() },
      { name: 'city', label: 'City' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map((s) => ({ value: s, label: labelize(s) })) },
    ],
  },
]

export default function Members() {
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { state, update, query } = useListState(['status', 'country'], { sort: 'updatedAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => memberService.list(query), [JSON.stringify(query)])
  const [creating, setCreating] = useState(false)

  const columns: Column<Member>[] = [
    { key: 'lastName', header: 'Name', sortable: true, render: (m) => <span className="inline-flex items-center gap-2">{m.firstName} {m.lastName} {m.isDemo ? <DemoTag /> : null}</span> },
    { key: 'email', header: 'Email', sortable: true, render: (m) => <span className="text-teal-900/75">{m.email}</span>, mobile: true },
    { key: 'country', header: 'Country', sortable: true, render: (m) => m.country ?? '—', mobile: true },
    { key: 'city', header: 'City', render: (m) => m.city ?? '—', optional: true },
    { key: 'groups', header: 'Groups', render: (m) => (m.groupIds?.length ? `${m.groupIds.length}` : '—') },
    { key: 'joinedAt', header: 'Joined', sortable: true, render: (m) => formatDay(m.joinedAt ?? m.createdAt) },
    { key: 'status', header: 'Status', sortable: true, render: (m) => <StatusBadge status={m.status} />, mobile: true },
  ]

  return (
    <>
      <PageHeader
        title="Members"
        description="People who have become part of Global Harvest. Create members directly or convert them from registrations."
        actions={can('members:write') ? <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>Add member</Button> : null}
      />
      <DataTable
        what="members"
        storageKey="members"
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
        rowHref={(m) => `/admin/members/${m.id}`}
        empty={{ title: 'No members yet.', body: 'Convert a registration into a member, or add one directly.', action: <Button to="/admin/registrations">Go to registrations</Button> }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search members…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
            <FilterSelect label="Country" value={state.filters.country} onChange={(v) => update({ filters: { country: v } })} options={countryOptions()} />
          </>
        }
      />
      <Drawer open={creating} onClose={() => setCreating(false)} title="Add member">
        <RecordForm
          sections={memberForm}
          initial={{ status: 'active', groupIds: [], bibleStudyIds: [], eventSlugs: [], joinedAt: new Date().toISOString() }}
          submitLabel="Create member"
          onCancel={() => setCreating(false)}
          onSubmit={async (values) => {
            const m = await memberService.create(values as Partial<Member>)
            notify({ tone: 'success', title: 'Member created' })
            navigate(`/admin/members/${m.id}`)
          }}
        />
      </Drawer>
    </>
  )
}

export function MemberDetail() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { data: member, setData, loading, error, reload } = useResource(() => memberService.get(id), [id])
  const notes = useResource(() => memberService.notes(id), [id])
  const groups = useResource(() => groupService.list({ pageSize: 100 }), [])
  const studies = useResource(() => (can('bible_studies:read') ? bibleStudyService.list({ pageSize: 100 }) : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 100 })), [])
  const [editing, setEditing] = useState(false)
  const [assign, setAssign] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (error) return <Card><ErrorState error={error} onRetry={reload} what="this member" /></Card>
  if (loading || !member) return <Card><LoadingBlock /></Card>
  const canWrite = can('members:write')
  const memberGroups = (groups.data?.items ?? []).filter((g) => member.groupIds?.includes(g.id))
  const memberStudies = (studies.data?.items ?? []).filter((s) => member.bibleStudyIds?.includes(s.id))

  const save = async (patch: Partial<Member>, msg = 'Member updated') => {
    const updated = await memberService.update(member.id, patch)
    setData(updated)
    notify({ tone: 'success', title: msg })
  }

  return (
    <>
      <PageHeader
        back={{ to: '/admin/members', label: 'Members' }}
        title={<span className="inline-flex flex-wrap items-center gap-3">{member.firstName} {member.lastName} <StatusBadge status={member.status} /> {member.isDemo ? <DemoTag /> : null}</span>}
        description={`Member since ${formatDay(member.joinedAt ?? member.createdAt)}`}
        actions={
          canWrite ? (
            <>
              <Button icon="edit" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}>Delete</Button>
            </>
          ) : null
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Profile">
            <DetailList
              items={[
                { label: 'Email', value: <a className="text-teal-700 hover:underline" href={`mailto:${member.email}`}>{member.email}</a> },
                { label: 'Phone', value: member.phone },
                { label: 'Country', value: member.country },
                { label: 'City', value: member.city },
                { label: 'Registration', value: member.registrationId ? <Link className="text-teal-700 hover:underline" to={`/admin/registrations/${member.registrationId}`}>View original registration</Link> : 'Added directly' },
                { label: 'Events attended', value: member.eventSlugs?.length ? member.eventSlugs.join(', ') : null },
              ]}
            />
          </Card>
          <NotesPanel
            notes={notes.data ?? []}
            canWrite={canWrite}
            kinds={['note']}
            onAdd={async (body) => {
              await memberService.addNote(member.id, body)
              notes.reload()
            }}
          />
        </div>
        <div className="space-y-6">
          <Card title="Status">
            <SelectField label="Member status" value={member.status} disabled={!canWrite} onChange={(e) => save({ status: e.target.value as Member['status'] }, 'Status updated')} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
          </Card>
          <Card title="Groups">
            {memberGroups.length ? (
              <ul className="mb-4 space-y-2">
                {memberGroups.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link to={`/admin/groups/${g.id}`} className="text-teal-800 hover:underline">{g.name}</Link>
                    {can('groups:write') ? (
                      <button type="button" className="text-xs text-coral-700 hover:underline" onClick={async () => { await groupService.assign(g.id, member.id, 'remove'); reload() }}>Remove</button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-teal-900/55">Not in any group yet.</p>
            )}
            {can('groups:write') ? (
              <div className="flex gap-2">
                <label htmlFor="assign-group" className="sr-only">Assign to group</label>
                <select id="assign-group" value={assign} onChange={(e) => setAssign(e.target.value)} className="h-9 flex-1 rounded-lg border-0 bg-white px-2 text-sm ring-1 ring-teal-900/15">
                  <option value="">Assign to group…</option>
                  {(groups.data?.items ?? []).filter((g) => !member.groupIds?.includes(g.id)).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <Button size="sm" variant="primary" disabled={!assign} onClick={async () => { await groupService.assign(assign, member.id); setAssign(''); reload(); notify({ tone: 'success', title: 'Assigned to group' }) }}>Assign</Button>
              </div>
            ) : null}
          </Card>
          <Card title="Bible studies">
            {memberStudies.length ? (
              <ul className="space-y-1.5 text-sm">{memberStudies.map((s) => <li key={s.id}><Tag>{s.title}</Tag></li>)}</ul>
            ) : (
              <p className="text-sm text-teal-900/55">Not enrolled in a Bible study.</p>
            )}
            {canWrite && studies.data?.items.length ? (
              <select
                aria-label="Enrol in Bible study"
                value=""
                onChange={(e) => e.target.value && save({ bibleStudyIds: [...(member.bibleStudyIds ?? []), e.target.value] }, 'Enrolled in Bible study')}
                className="mt-3 h-9 w-full rounded-lg border-0 bg-white px-2 text-sm ring-1 ring-teal-900/15"
              >
                <option value="">Enrol in a Bible study…</option>
                {studies.data.items.filter((s) => !member.bibleStudyIds?.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            ) : null}
          </Card>
        </div>
      </div>
      <Drawer open={editing} onClose={() => setEditing(false)} title="Edit member">
        <RecordForm sections={memberForm} initial={member as unknown as Record<string, unknown>} onCancel={() => setEditing(false)} onSubmit={async (v) => { await save(v as Partial<Member>); setEditing(false) }} />
      </Drawer>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        danger
        title="Delete this member?"
        body="This removes the member record and group assignments. The original registration (if any) is kept."
        confirmLabel="Delete member"
        onConfirm={async () => { await memberService.remove(member.id); notify({ tone: 'success', title: 'Member deleted' }); navigate('/admin/members') }}
      />
    </>
  )
}
