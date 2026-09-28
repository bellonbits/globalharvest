/**
 * Lightweight SVG charts for the admin (no chart library).
 * Palette validated with the dataviz checks (CVD separation, chroma, contrast):
 *   series-1 #008C9E (teal) · series-2 #D95926 (coral) · series-3 #6A55C2 (violet)
 * Single-series charts use series-1. Text always uses ink tokens, never series colour.
 * Every chart has a hover tooltip and an accessible table view.
 */
import { useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { COUNTRY_PINS } from '../../content/countryPins.generated'
import { WORLD_DOTS, WORLD_HEIGHT, WORLD_WIDTH } from '../../content/worldDots.generated'
import { cn } from '../../lib/cn'
import type { SeriesPoint } from '../types'
import { EmptyState } from './ui'

export const SERIES = ['#008C9E', '#D95926', '#6A55C2'] as const
const INK = { primary: '#04272e', secondary: 'rgb(4 39 46 / 0.62)', muted: 'rgb(4 39 46 / 0.42)', grid: 'rgb(4 39 46 / 0.08)' }

const fmt = (n: number) => new Intl.NumberFormat('en').format(n)

/** Wraps a chart with a "Chart / Table" switch so data is never colour- or shape-only. */
export function ChartFrame({ title, subtitle, table, children, empty }: { title: string; subtitle?: string; table: { head: string[]; rows: (string | number)[][] }; children: ReactNode; empty?: boolean }) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <section className="min-w-0 rounded-xl bg-white p-5 ring-1 ring-teal-900/10">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[0.95rem] font-semibold text-teal-900">{title}</h2>
          {subtitle ? <p className="text-xs text-teal-900/55">{subtitle}</p> : null}
        </div>
        {!empty ? (
          <div className="flex rounded-lg bg-cream-50 p-0.5 text-xs ring-1 ring-teal-900/10" role="group" aria-label={`${title} view`}>
            {(['chart', 'table'] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn('rounded-md px-2.5 py-1 capitalize', view === v ? 'bg-white font-medium text-teal-900 shadow-sm' : 'text-teal-900/60')}>
                {v}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {empty ? (
        <EmptyState icon="chart" title="No data for this period" body="Data will appear here as it’s collected." />
      ) : view === 'chart' ? (
        children
      ) : (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-teal-900/55 uppercase">
              <tr>{table.head.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-teal-900/[0.06]">
              {table.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className={cn('py-2 pr-4 text-teal-900', j > 0 && 'tabular-nums')}>{typeof c === 'number' ? fmt(c) : c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Line (single series, change over time) with crosshair tooltip       */
/* ------------------------------------------------------------------ */

export function LineChart({ data, label, formatX = (s: string) => s }: { data: SeriesPoint[]; label: string; formatX?: (s: string) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 640
  const H = 220
  const pad = { l: 36, r: 12, t: 12, b: 28 }
  const max = Math.max(1, ...data.map((d) => d.value))
  const niceMax = Math.ceil(max / 4) * 4 || 4
  const x = (i: number) => pad.l + (data.length <= 1 ? (W - pad.l - pad.r) / 2 : (i / (data.length - 1)) * (W - pad.l - pad.r))
  const y = (v: number) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b)
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join('')
  const area = data.length ? `${line}L${x(data.length - 1)} ${y(0)}L${x(0)} ${y(0)}Z` : ''
  const ticks = [0, niceMax / 4, niceMax / 2, (3 * niceMax) / 4, niceMax]
  const labelEvery = Math.ceil(data.length / 6)
  const gid = useId()

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label}: line chart`} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SERIES[0]} stopOpacity="0.16" />
            <stop offset="1" stopColor={SERIES[0]} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={INK.grid} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={INK.muted}>
              {Math.round(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.label} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={INK.muted}>
              {formatX(d.label)}
            </text>
          ) : null,
        )}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={SERIES[0]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null ? (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke={INK.muted} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={SERIES[0]} stroke="white" strokeWidth="2" />
          </>
        ) : null}
        {/* Hit areas wider than the marks */}
        {data.map((d, i) => (
          <rect
            key={d.label}
            x={x(i) - (W - pad.l - pad.r) / Math.max(1, data.length - 1) / 2}
            y={pad.t}
            width={(W - pad.l - pad.r) / Math.max(1, data.length - 1)}
            height={H - pad.t - pad.b}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            tabIndex={0}
            aria-label={`${formatX(d.label)}: ${d.value}`}
          />
        ))}
      </svg>
      {hover !== null ? (
        <div className="pointer-events-none absolute top-0 rounded-lg bg-teal-950 px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ left: `${(x(hover) / W) * 100}%`, transform: 'translateX(-50%)' }}>
          <div className="text-white/70">{formatX(data[hover].label)}</div>
          <div className="font-semibold tabular-nums">
            {fmt(data[hover].value)} {label.toLowerCase()}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Horizontal bar list (magnitude by category) — direct-labelled       */
/* ------------------------------------------------------------------ */

export function BarList({ data, max: maxItems = 8, formatLabel = (s: string) => s }: { data: SeriesPoint[]; max?: number; formatLabel?: (s: string) => string }) {
  const items = data.slice(0, maxItems)
  const rest = data.slice(maxItems).reduce((a, d) => a + d.value, 0)
  const rows = rest ? [...items, { label: 'Other', value: rest }] : items
  const max = Math.max(1, ...rows.map((d) => d.value))
  return (
    <ul className="space-y-2.5">
      {rows.map((d) => (
        <li key={d.label} className="group" title={`${formatLabel(d.label)}: ${fmt(d.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-teal-900">{formatLabel(d.label)}</span>
            <span className="tabular-nums text-teal-900/65">{fmt(d.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-teal-900/[0.06]">
            <div className="h-2 rounded-full transition-[width] duration-700 group-hover:brightness-110" style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: SERIES[0] }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Donut (part-to-whole, ≤ 3 categories) with legend + direct labels   */
/* ------------------------------------------------------------------ */

export function DonutChart({ data, formatLabel = (s: string) => s }: { data: SeriesPoint[]; formatLabel?: (s: string) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const R = 60
  const r = 40
  const arcs = useMemo(() => {
    let a0 = -Math.PI / 2
    return data.map((d) => {
      const span = (d.value / total) * Math.PI * 2
      const gap = data.length > 1 ? 0.03 : 0 // 2px-ish surface gap between segments
      const a1 = a0 + span
      const s = a0 + gap / 2
      const e = a1 - gap / 2
      const large = e - s > Math.PI ? 1 : 0
      const p = (ang: number, rad: number) => `${70 + rad * Math.cos(ang)} ${70 + rad * Math.sin(ang)}`
      const path =
        span >= Math.PI * 2 - 0.001
          ? `M${p(0, R)}A${R} ${R} 0 1 1 ${p(Math.PI, R)}A${R} ${R} 0 1 1 ${p(0, R)}M${p(0, r)}A${r} ${r} 0 1 0 ${p(Math.PI, r)}A${r} ${r} 0 1 0 ${p(0, r)}Z`
          : `M${p(s, R)}A${R} ${R} 0 ${large} 1 ${p(e, R)}L${p(e, r)}A${r} ${r} 0 ${large} 0 ${p(s, r)}Z`
      a0 = a1
      return path
    })
  }, [data, total])
  const shown = hover === null ? null : data[hover]
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="size-40 shrink-0" role="img" aria-label="Donut chart">
        {arcs.map((d, i) => (
          <path key={i} d={d} fill={SERIES[i % SERIES.length]} fillRule="evenodd" opacity={hover === null || hover === i ? 1 : 0.35} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
        ))}
        <text x="70" y="68" textAnchor="middle" fontSize="18" fontWeight="600" fill={INK.primary}>
          {fmt(shown ? shown.value : total === 1 && !data.length ? 0 : data.reduce((a, d) => a + d.value, 0))}
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="9" fill={INK.secondary}>
          {shown ? formatLabel(shown.label) : 'total'}
        </text>
      </svg>
      <ul className="w-full space-y-2" aria-label="Legend">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="flex items-center gap-2 text-teal-900">
              <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
              {formatLabel(d.label)}
            </span>
            <span className="tabular-nums text-teal-900/65">
              {fmt(d.value)} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Country map — only countries present in the data are plotted       */
/* ------------------------------------------------------------------ */

const WORLD = WORLD_DOTS.split(' ').map((p) => `M${p.replace(',', ' ')}h0`).join('')

let nameToCode: Map<string, string> | null = null
export function countryCode(name: string): string | null {
  if (!nameToCode) {
    nameToCode = new Map()
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' })
      for (const code of Object.keys(COUNTRY_PINS)) {
        const n = dn.of(code)
        if (n) nameToCode.set(n.toLowerCase(), code)
      }
    } catch {
      /* Intl unavailable */
    }
  }
  return nameToCode.get(name.toLowerCase()) ?? null
}

export function CountryMap({ data }: { data: { country: string; count: number }[] }) {
  const [hover, setHover] = useState<string | null>(null)
  const max = Math.max(1, ...data.map((d) => d.count))
  const pins = data
    .map((d) => ({ ...d, code: countryCode(d.country) }))
    .filter((d): d is typeof d & { code: string } => Boolean(d.code && COUNTRY_PINS[d.code]))
  const active = pins.find((p) => p.country === hover)
  return (
    <div className="relative">
      <svg viewBox={`-1 -1 ${WORLD_WIDTH + 2} ${WORLD_HEIGHT + 2}`} className="h-auto w-full" role="img" aria-label={`Map of ${pins.length} countries represented`}>
        <path d={WORLD} stroke="rgb(4 39 46 / 0.16)" strokeWidth={0.5} strokeLinecap="round" fill="none" />
        {pins.map((p) => {
          const [x, y] = COUNTRY_PINS[p.code]
          const radius = 0.9 + (p.count / max) * 2.4
          return (
            <g key={p.code} onMouseEnter={() => setHover(p.country)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              <circle cx={x} cy={y} r={radius} fill={SERIES[0]} fillOpacity={0.25} stroke="white" strokeWidth={0.3} />
              <circle cx={x} cy={y} r={0.7} fill={SERIES[0]} />
              <circle cx={x} cy={y} r={Math.max(radius, 2.5)} fill="transparent">
                <title>
                  {p.country}: {p.count}
                </title>
              </circle>
            </g>
          )
        })}
      </svg>
      {active ? (
        <div className="pointer-events-none absolute top-2 left-2 rounded-lg bg-teal-950 px-2.5 py-1.5 text-xs text-white shadow-lg">
          <div className="font-semibold">{active.country}</div>
          <div className="tabular-nums text-white/75">{fmt(active.count)}</div>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Stat card (hero number + optional real trend)                      */
/* ------------------------------------------------------------------ */

export function StatCard({ label, value, trend, hint, href }: { label: string; value: number | string; trend?: number | null; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-medium tracking-wide text-teal-900/55 uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-teal-950 tabular-nums">{typeof value === 'number' ? fmt(value) : value}</p>
      <p className="mt-1.5 text-xs text-teal-900/55">
        {trend === null || trend === undefined ? (
          (hint ?? 'Not enough history for a trend')
        ) : (
          <>
            <span className={cn('font-semibold', trend >= 0 ? 'text-emerald-700' : 'text-coral-700')}>
              {trend >= 0 ? '▲' : '▼'} {trend >= 0 ? '+' : ''}
              {trend}%
            </span>{' '}
            vs previous 30 days
          </>
        )}
      </p>
    </>
  )
  const cls = 'block rounded-xl bg-white p-5 ring-1 ring-teal-900/10 transition hover:ring-teal-900/20'
  return href ? (
    <Link to={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
