import { useEffect, useState } from 'react'
import { Icon } from '../../components/brand/Icon'
import { DataTable, type Column } from '../components/DataTable'
import { Drawer, FilterSelect, PageHeader, SearchInput, TextField } from '../components/ui'
import { formatDateTime, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { auditService } from '../services'
import type { AuditLogEntry } from '../types'

export default function AuditLog() {
  const { state, update, query } = useListState(['user', 'action', 'resource', 'from', 'to'], { pageSize: 50 })
  const [userQ, setUserQ] = useState(state.filters.user)
  const [actionQ, setActionQ] = useState(state.filters.action)
  const du = useDebounced(userQ)
  const da = useDebounced(actionQ)
  useEffect(() => {
    if (du !== state.filters.user || da !== state.filters.action) update({ filters: { user: du, action: da } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [du, da])
  const { data, loading, error, reload } = useResource(() => auditService.list(query), [JSON.stringify(query)])
  const [open, setOpen] = useState<AuditLogEntry | null>(null)
  const columns: Column<AuditLogEntry>[] = [
    { key: 'createdAt', header: 'Time', render: (a) => <span className="whitespace-nowrap">{formatDateTime(a.createdAt)}</span> },
    { key: 'user', header: 'User', render: (a) => a.userEmail ?? <span className="text-teal-900/50">Anonymous / system</span>, mobile: true },
    { key: 'action', header: 'Action', render: (a) => <code className={`rounded px-1.5 py-0.5 text-xs ${a.action.includes('denied') || a.action.includes('failed') || a.action.includes('locked') ? 'bg-coral-50 text-coral-800' : 'bg-teal-900/5 text-teal-900'}`}>{a.action}</code>, mobile: true },
    { key: 'resource', header: 'Resource', render: (a) => labelize(a.resource) },
    { key: 'resourceId', header: 'Resource ID', render: (a) => <span className="font-mono text-xs text-teal-900/60">{a.resourceId ? `${a.resourceId.slice(0, 12)}${a.resourceId.length > 12 ? '…' : ''}` : '—'}</span>, optional: true },
    { key: 'ip', header: 'IP', render: (a) => <span className="font-mono text-xs text-teal-900/60">{a.ip ?? '—'}</span>, optional: true },
  ]
  return (
    <>
      <PageHeader title="Audit log" description="A permanent, append-only record of administrative actions. Entries cannot be edited or deleted from the portal.">
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-teal-900/55"><Icon name="shield" size={14} /> IP and device details are captured by the server.</p>
      </PageHeader>
      <DataTable
        what="audit entries"
        storageKey="audit"
        columns={columns}
        rows={data?.items ?? null}
        total={data?.total}
        loading={loading}
        error={error}
        onRetry={reload}
        page={state.page}
        pageSize={state.pageSize}
        onPage={(page) => update({ page }, false)}
        onRowClick={setOpen}
        empty={{ title: 'No matching entries.', body: 'Administrative actions will be recorded here.' }}
        toolbar={
          <>
            <SearchInput value={userQ} onChange={setUserQ} placeholder="Admin email…" className="w-full sm:w-52" />
            <SearchInput value={actionQ} onChange={setActionQ} placeholder="Action (e.g. login)…" className="w-full sm:w-52" />
            <FilterSelect label="Resource" value={state.filters.resource} onChange={(v) => update({ filters: { resource: v } })} options={(data?.resources ?? []).map((r) => ({ value: r, label: labelize(r) }))} />
            <TextField label="From" type="date" value={state.filters.from} onChange={(e) => update({ filters: { from: e.target.value } })} className="w-36 [&_label]:sr-only" />
            <TextField label="To" type="date" value={state.filters.to} onChange={(e) => update({ filters: { to: e.target.value } })} className="w-36 [&_label]:sr-only" />
          </>
        }
      />
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title="Audit entry">
        {open ? <pre className="overflow-auto rounded-xl bg-teal-950 p-4 text-xs leading-relaxed text-cream-100">{JSON.stringify(open, null, 2)}</pre> : null}
      </Drawer>
    </>
  )
}
