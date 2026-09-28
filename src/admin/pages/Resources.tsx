import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { RecordForm, type FormSectionConfig } from '../components/RecordForm'
import { Button, ConfirmDialog, DemoTag, Drawer, FilterSelect, LoadingBlock, PageHeader, SearchInput, StatusBadge, Tag } from '../components/ui'
import { formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { resourceService } from '../services'
import type { ResourceRecord } from '../types'

const TYPES = ['study-notes', 'devotional', 'prayer-guide', 'sermon', 'article', 'pdf', 'video', 'audio', 'reading-plan'].map((v) => ({ value: v, label: labelize(v) }))
const STATUSES = ['draft', 'published', 'archived'] as const

const resourceForm: FormSectionConfig[] = [
  {
    title: 'Resource',
    fields: [
      { name: 'title', label: 'Title', required: true, wide: true },
      { name: 'type', label: 'Type', type: 'select', required: true, options: TYPES },
      { name: 'author', label: 'Author' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category', label: 'Category', placeholder: 'e.g. Prayer, Discipleship' },
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },
  {
    title: 'Files & links',
    description: 'Upload files in the Media library, then paste their URL here. Large files are never stored in the website itself.',
    fields: [
      { name: 'fileUrl', label: 'File URL', type: 'url', wide: true },
      { name: 'externalUrl', label: 'External URL', type: 'url', wide: true, hint: 'e.g. a YouTube or podcast link' },
      { name: 'coverImage', label: 'Cover image URL', type: 'url', wide: true },
    ],
  },
  {
    title: 'Publishing',
    fields: [
      { name: 'publishedDate', label: 'Published date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map((s) => ({ value: s, label: labelize(s) })) },
    ],
  },
]

export default function Resources({ creating: createRoute = false }: { creating?: boolean }) {
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const editId = params.get('edit')
  const { state, update, query } = useListState(['status', 'type'], { sort: 'updatedAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => resourceService.list(query), [JSON.stringify(query)])
  const editing = useResource(() => (editId ? resourceService.get(editId) : Promise.resolve(null)), [editId])
  const [toDelete, setToDelete] = useState<ResourceRecord | null>(null)
  const close = () => {
    if (createRoute) navigate('/admin/resources')
    else {
      const n = new URLSearchParams(params)
      n.delete('edit')
      setParams(n, { replace: true })
    }
  }
  const canWrite = can('resources:write')

  const columns: Column<ResourceRecord>[] = [
    { key: 'title', header: 'Title', sortable: true, render: (r) => <span className="inline-flex items-center gap-2">{r.title} {r.isDemo ? <DemoTag /> : null}</span> },
    { key: 'type', header: 'Type', render: (r) => <Tag>{labelize(r.type)}</Tag>, mobile: true },
    { key: 'author', header: 'Author', render: (r) => r.author ?? '—', optional: true },
    { key: 'category', header: 'Category', render: (r) => r.category ?? '—' },
    { key: 'publishedDate', header: 'Published', sortable: true, render: (r) => formatDay(r.publishedDate) },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} />, mobile: true },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) =>
        canWrite ? (
          <span className="inline-flex gap-1">
            {r.status !== 'published' ? <Button size="sm" variant="ghost" onClick={async () => { await resourceService.update(r.id, { status: 'published' }); notify({ tone: 'success', title: 'Published' }); reload() }}>Publish</Button> : null}
            <Button size="sm" variant="ghost" icon="trash" aria-label={`Delete ${r.title}`} onClick={() => setToDelete(r)} />
          </span>
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader title="Resources" description="Study notes, devotionals, prayer guides, sermons, articles, media and reading plans." actions={canWrite ? <Button variant="primary" icon="plus" to="/admin/resources/new">New resource</Button> : null} />
      <DataTable
        what="resources"
        storageKey="resources"
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
        onRowClick={(r) => {
          const n = new URLSearchParams(params)
          n.set('edit', r.id)
          setParams(n, { replace: true })
        }}
        empty={{ title: 'No resources yet.', body: 'Add reading plans, guides and teaching for the Resources page.', action: canWrite ? <Button variant="primary" icon="plus" to="/admin/resources/new">New resource</Button> : undefined }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search resources…" className="w-full sm:w-64" />
            <FilterSelect label="Type" value={state.filters.type} onChange={(v) => update({ filters: { type: v } })} options={TYPES} />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
          </>
        }
      />
      <Drawer open={createRoute || Boolean(editId)} onClose={close} title={createRoute ? 'New resource' : 'Edit resource'} width="max-w-2xl">
        {createRoute || editing.data ? (
          <RecordForm
            key={editId ?? 'new'}
            sections={resourceForm}
            readOnly={!canWrite}
            initial={(editing.data as unknown as Record<string, unknown>) ?? { status: 'draft', type: 'article', tags: [] }}
            submitLabel={createRoute ? 'Create resource' : 'Save changes'}
            onCancel={close}
            onSubmit={async (values) => {
              if (createRoute) await resourceService.create(values as Partial<ResourceRecord>)
              else if (editId) await resourceService.update(editId, values as Partial<ResourceRecord>)
              notify({ tone: 'success', title: createRoute ? 'Resource created' : 'Resource saved' })
              close()
              reload()
            }}
          />
        ) : (
          <LoadingBlock />
        )}
      </Drawer>
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} danger title="Delete resource?" body={<>Delete <strong>{toDelete?.title}</strong>? This can’t be undone.</>} confirmLabel="Delete" onConfirm={async () => { if (toDelete) { await resourceService.remove(toDelete.id); setToDelete(null); reload() } }} />
    </>
  )
}
