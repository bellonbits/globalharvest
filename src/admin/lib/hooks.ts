import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clearApiCache } from '../api/client'

/** Loads data with loading / error / reload state. `deps` re-trigger the load. */
export function useResource<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    loaderRef
      .current()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => {
    clearApiCache()
    setTick((t) => t + 1)
  }, [])
  return { data, setData, loading, error, reload }
}

export interface ListState {
  q: string
  page: number
  pageSize: number
  sort: string
  dir: 'asc' | 'desc'
  filters: Record<string, string>
}

/**
 * Table state (search, filters, sort, page) kept in the URL so views are
 * shareable and survive refresh. Search input is debounced.
 */
export function useListState(filterKeys: string[] = [], defaults: Partial<ListState> = {}) {
  const [params, setParams] = useSearchParams()
  const state: ListState = useMemo(
    () => ({
      q: params.get('q') ?? '',
      page: Number(params.get('page')) || 1,
      pageSize: Number(params.get('pageSize')) || defaults.pageSize || 25,
      sort: params.get('sort') ?? defaults.sort ?? '',
      dir: (params.get('dir') as 'asc' | 'desc') ?? defaults.dir ?? 'desc',
      filters: Object.fromEntries(filterKeys.map((k) => [k, params.get(k) ?? ''])),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params],
  )

  const update = useCallback(
    (patch: Partial<Omit<ListState, 'filters'>> & { filters?: Record<string, string> }, resetPage = true) => {
      const next = new URLSearchParams(params)
      const set = (k: string, v: string | number | undefined) => (v === undefined || v === '' ? next.delete(k) : next.set(k, String(v)))
      if (patch.q !== undefined) set('q', patch.q)
      if (patch.sort !== undefined) set('sort', patch.sort)
      if (patch.dir !== undefined) set('dir', patch.dir)
      if (patch.pageSize !== undefined) set('pageSize', patch.pageSize)
      if (patch.filters) for (const [k, v] of Object.entries(patch.filters)) set(k, v)
      if (patch.page !== undefined) set('page', patch.page === 1 ? undefined : patch.page)
      else if (resetPage) next.delete('page')
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  const query = useMemo(
    () => ({ q: state.q, page: state.page, pageSize: state.pageSize, sort: state.sort || undefined, dir: state.dir, ...state.filters }),
    [state],
  )
  return { state, update, query }
}

/** Debounced value (for search boxes). */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—'
export const formatDay = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)) : '—'
export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  return formatDay(iso)
}
export const labelize = (s: string) => s.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
