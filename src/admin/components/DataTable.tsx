import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/brand/Icon'
import { cn } from '../../lib/cn'
import { Button, EmptyState, ErrorState, LoadingBlock } from './ui'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortable?: boolean
  className?: string
  /** Hidden by default (user can show it via the Columns menu). */
  optional?: boolean
  /** Shown in the mobile card view. The first column is always the card title. */
  mobile?: boolean
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  rows: T[] | null
  total?: number
  loading: boolean
  error: Error | null
  onRetry?: () => void
  page?: number
  pageSize?: number
  onPage?: (page: number) => void
  sort?: string
  dir?: 'asc' | 'desc'
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  selectable?: boolean
  bulkActions?: (ids: string[], clear: () => void) => ReactNode
  rowHref?: (row: T) => string
  onRowClick?: (row: T) => void
  empty: { title: string; body?: ReactNode; action?: ReactNode }
  toolbar?: ReactNode
  what?: string
  /** Stable id used to remember column visibility. */
  storageKey?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  total = rows?.length ?? 0,
  loading,
  error,
  onRetry,
  page = 1,
  pageSize = 25,
  onPage,
  sort,
  dir = 'desc',
  onSort,
  selectable,
  bulkActions,
  rowHref,
  onRowClick,
  empty,
  toolbar,
  what,
  storageKey,
}: DataTableProps<T>) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(() => {
    try {
      const saved = storageKey ? localStorage.getItem(`gh-admin-cols:${storageKey}`) : null
      if (saved) return new Set(JSON.parse(saved) as string[])
    } catch {
      /* ignore */
    }
    return new Set(columns.filter((c) => c.optional).map((c) => c.key))
  })
  const [colsOpen, setColsOpen] = useState(false)
  const colsRef = useRef<HTMLDivElement>(null)

  useEffect(() => setSelected(new Set()), [rows])
  useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(`gh-admin-cols:${storageKey}`, JSON.stringify([...hidden]))
    } catch {
      /* ignore */
    }
  }, [hidden, storageKey])
  useEffect(() => {
    if (!colsOpen) return
    const close = (e: MouseEvent) => !colsRef.current?.contains(e.target as Node) && setColsOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [colsOpen])

  const visible = useMemo(() => columns.filter((c) => !hidden.has(c.key)), [columns, hidden])
  const ids = rows?.map((r) => r.id) ?? []
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id))
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const clear = () => setSelected(new Set())
  const open = (row: T) => (onRowClick ? onRowClick(row) : rowHref ? navigate(rowHref(row)) : undefined)
  const clickable = Boolean(onRowClick || rowHref)

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const headerCell = (c: Column<T>) => {
    const active = sort === c.key
    if (!c.sortable || !onSort) return c.header
    return (
      <button type="button" onClick={() => onSort(c.key, active && dir === 'desc' ? 'asc' : 'desc')} className="inline-flex items-center gap-1 hover:text-teal-900">
        {c.header}
        <Icon name={active ? (dir === 'asc' ? 'chevronUp' : 'chevronDown') : 'chevronDown'} size={14} className={active ? 'opacity-100' : 'opacity-30'} />
        <span className="sr-only">{active ? `sorted ${dir === 'asc' ? 'ascending' : 'descending'}` : 'sortable'}</span>
      </button>
    )
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl bg-white ring-1 ring-teal-900/10">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-teal-900/8 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">{toolbar}</div>
        <div className="relative" ref={colsRef}>
          <Button size="sm" variant="ghost" icon="sidebar" onClick={() => setColsOpen((o) => !o)} aria-expanded={colsOpen} className="hidden md:inline-flex">
            Columns
          </Button>
          {colsOpen ? (
            <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-teal-900/10">
              {columns.slice(1).map((c) => (
                <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-teal-900 hover:bg-cream-50">
                  <input
                    type="checkbox"
                    checked={!hidden.has(c.key)}
                    onChange={() =>
                      setHidden((h) => {
                        const n = new Set(h)
                        if (n.has(c.key)) n.delete(c.key)
                        else n.add(c.key)
                        return n
                      })
                    }
                    className="accent-teal-700"
                  />
                  {c.header}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bulk bar */}
      {selectable && selected.size > 0 && bulkActions ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-teal-900/8 bg-teal-50/60 px-4 py-2.5" role="region" aria-label="Bulk actions">
          <span className="text-sm font-medium text-teal-900">{selected.size} selected</span>
          <span className="mx-1 h-4 w-px bg-teal-900/15" />
          {bulkActions([...selected], clear)}
          <Button size="sm" variant="ghost" onClick={clear}>
            Clear
          </Button>
        </div>
      ) : null}

      {error ? (
        <ErrorState error={error} onRetry={onRetry} what={what} />
      ) : loading && !rows ? (
        <LoadingBlock label={`Loading ${what ?? 'data'}…`} />
      ) : !rows?.length ? (
        <EmptyState title={empty.title} body={empty.body} action={empty.action} />
      ) : (
        <div className={cn('relative', loading && 'opacity-60')} aria-busy={loading || undefined}>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-50/70 text-xs font-medium tracking-wide text-teal-900/55 uppercase">
                <tr>
                  {selectable ? (
                    <th scope="col" className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all on this page"
                        checked={allSelected}
                        onChange={() => setSelected(allSelected ? new Set() : new Set(ids))}
                        className="accent-teal-700"
                      />
                    </th>
                  ) : null}
                  {visible.map((c) => (
                    <th key={c.key} scope="col" className={cn('px-4 py-3 font-medium whitespace-nowrap', c.className)} aria-sort={sort === c.key ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                      {headerCell(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/[0.06]">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn('group transition-colors', clickable && 'cursor-pointer hover:bg-cream-50/80', selected.has(row.id) && 'bg-teal-50/50')}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('input,button,a,select')) return
                      open(row)
                    }}
                  >
                    {selectable ? (
                      <td className="px-4 py-3">
                        <input type="checkbox" aria-label="Select row" checked={selected.has(row.id)} onChange={() => toggle(row.id)} className="accent-teal-700" />
                      </td>
                    ) : null}
                    {visible.map((c, i) => (
                      <td key={c.key} className={cn('px-4 py-3 align-middle text-teal-900', c.className)}>
                        {i === 0 && clickable ? (
                          <button type="button" onClick={() => open(row)} className="text-left font-medium text-teal-900 group-hover:text-teal-700 focus-visible:underline">
                            {c.render(row)}
                          </button>
                        ) : (
                          c.render(row)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-teal-900/[0.06] md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="flex gap-3 p-4">
                {selectable ? <input type="checkbox" aria-label="Select" checked={selected.has(row.id)} onChange={() => toggle(row.id)} className="mt-1 accent-teal-700" /> : null}
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(row)} disabled={!clickable}>
                  <div className="font-medium text-teal-900">{columns[0].render(row)}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-teal-900/65">
                    {columns
                      .filter((c) => c.mobile)
                      .map((c) => (
                        <span key={c.key} className="inline-flex items-center gap-1">
                          {c.render(row)}
                        </span>
                      ))}
                  </div>
                </button>
                {clickable ? <Icon name="chevronRight" size={18} className="mt-1 shrink-0 text-teal-900/30" /> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {onPage && rows && rows.length > 0 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-teal-900/8 px-4 py-3 text-sm text-teal-900/65">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" icon="chevronLeft" disabled={page <= 1} onClick={() => onPage(page - 1)}>
              <span className="sr-only sm:not-sr-only">Previous</span>
            </Button>
            <span className="px-2">
              {page} / {pages}
            </span>
            <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
              <span className="sr-only sm:not-sr-only">Next</span>
              <Icon name="chevronRight" size={15} />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
