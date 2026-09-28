import { useState } from 'react'
import { interestOptions } from '../../content/formOptions'
import { BarList, ChartFrame, CountryMap, DonutChart, LineChart, StatCard } from '../components/Charts'
import { Card, ErrorState, PageHeader, Skeleton, TextField } from '../components/ui'
import { labelize, useResource } from '../lib/hooks'
import { analyticsService } from '../services'

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 182, label: '6 months' },
  { value: 365, label: '12 months' },
]

const interestLabel = (v: string) => interestOptions.find((o) => o.value === v)?.label ?? labelize(v)

export default function Analytics() {
  const [days, setDays] = useState<number | 'custom'>(30)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const params = days === 'custom' ? (from && to ? { from, to } : null) : { days }
  const { data, loading, error, reload } = useResource(() => (params ? analyticsService.get(params) : Promise.resolve(null)), [JSON.stringify(params)])
  const fmtX = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString('en', data?.bucket === 'month' ? { month: 'short', year: '2-digit' } : { day: 'numeric', month: 'short' })

  return (
    <>
      <PageHeader title="Analytics" description="Built only from data actually stored — nothing is estimated or invented. Demo records are included while they exist." />
      <div className="mb-6 flex flex-wrap items-end gap-2" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button key={r.value} type="button" aria-pressed={days === r.value} onClick={() => setDays(r.value)} className={`h-9 rounded-lg px-3 text-sm ring-1 ${days === r.value ? 'bg-teal-800 text-white ring-teal-800' : 'bg-white text-teal-900 ring-teal-900/15 hover:ring-teal-900/30'}`}>
            {r.label}
          </button>
        ))}
        <button type="button" aria-pressed={days === 'custom'} onClick={() => setDays('custom')} className={`h-9 rounded-lg px-3 text-sm ring-1 ${days === 'custom' ? 'bg-teal-800 text-white ring-teal-800' : 'bg-white text-teal-900 ring-teal-900/15'}`}>
          Custom
        </button>
        {days === 'custom' ? (
          <>
            <TextField label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <TextField label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </>
        ) : null}
      </div>

      {error ? (
        <Card><ErrorState error={error} onRetry={reload} what="analytics" /></Card>
      ) : !data ? (
        loading ? <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div> : <Card><p className="text-sm text-teal-900/60">Choose a start and end date.</p></Card>
      ) : (
        <div className={loading ? 'opacity-60' : undefined}>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Totals for the period">
            <StatCard label="Registrations" value={data.totals.registrations} hint={`${data.range.from} → ${data.range.to}`} />
            <StatCard label="Event registrations" value={data.totals.eventRegistrations} hint="In this period" />
            {data.totals.prayerRequests !== null ? <StatCard label="Prayer requests" value={data.totals.prayerRequests} hint="In this period" /> : null}
            <StatCard label="Contact messages" value={data.totals.messages} hint="In this period" />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ChartFrame title="Registrations over time" subtitle={`Per ${data.bucket}`} empty={!data.registrationsOverTime.length} table={{ head: [labelize(data.bucket), 'Registrations'], rows: data.registrationsOverTime.map((d) => [fmtX(d.label), d.value]) }}>
                <LineChart data={data.registrationsOverTime} label="Registrations" formatX={fmtX} />
              </ChartFrame>
            </div>
            <ChartFrame title="Members by participation type" subtitle="From registrations" empty={!data.byParticipation.length} table={{ head: ['Participation', 'Count'], rows: data.byParticipation.map((d) => [labelize(d.label), d.value]) }}>
              <DonutChart data={data.byParticipation} formatLabel={labelize} />
            </ChartFrame>
          </div>

          <section className="mt-6" aria-labelledby="geo-title">
            <ChartFrame title="Global overview" subtitle={`${data.byCountry.length} countr${data.byCountry.length === 1 ? 'y' : 'ies'} represented in registrations`} empty={!data.byCountry.length} table={{ head: ['Country', 'Registrations'], rows: data.byCountry.map((d) => [d.country, d.count]) }}>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <CountryMap data={data.byCountry} />
                </div>
                <div>
                  <h3 id="geo-title" className="mb-3 text-xs font-medium tracking-wide text-teal-900/55 uppercase">Members by country</h3>
                  <BarList data={data.byCountry.map((d) => ({ label: d.country, value: d.count }))} max={10} />
                </div>
              </div>
            </ChartFrame>
          </section>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ChartFrame title="What people want to join" subtitle="Registrations by interest" empty={!data.byInterest.length} table={{ head: ['Interest', 'Count'], rows: data.byInterest.map((d) => [interestLabel(d.label), d.value]) }}>
              <BarList data={data.byInterest} formatLabel={interestLabel} />
            </ChartFrame>
            <ChartFrame title="Event registrations" subtitle="By event" empty={!data.eventRegistrations.length} table={{ head: ['Event', 'Registrations'], rows: data.eventRegistrations.map((d) => [d.label, d.value]) }}>
              <BarList data={data.eventRegistrations} formatLabel={labelize} />
            </ChartFrame>
            <ChartFrame title="Events by country" subtitle="Where event registrants are from" empty={!data.eventsByCountry.length} table={{ head: ['Country', 'Registrations'], rows: data.eventsByCountry.map((d) => [d.label, d.value]) }}>
              <BarList data={data.eventsByCountry} />
            </ChartFrame>
            {data.prayerRequests ? (
              <ChartFrame title="Prayer requests" subtitle="By category" empty={!data.prayerRequests.length} table={{ head: ['Category', 'Requests'], rows: data.prayerRequests.map((d) => [labelize(d.label), d.value]) }}>
                <BarList data={data.prayerRequests} formatLabel={labelize} />
              </ChartFrame>
            ) : null}
            <ChartFrame title="Groups by country" subtitle="All groups" empty={!data.groupsByCountry.length} table={{ head: ['Country', 'Groups'], rows: data.groupsByCountry.map((d) => [d.label, d.value]) }}>
              <BarList data={data.groupsByCountry} />
            </ChartFrame>
            <ChartFrame title="Bible studies by format" subtitle="All studies" empty={!data.studiesByFormat.length} table={{ head: ['Format', 'Studies'], rows: data.studiesByFormat.map((d) => [labelize(d.label), d.value]) }}>
              <BarList data={data.studiesByFormat} formatLabel={labelize} />
            </ChartFrame>
          </div>
          <p className="mt-6 text-xs text-teal-900/50">Resource downloads aren’t tracked yet — connect a privacy-friendly analytics provider in Settings → Integrations to add them.</p>
        </div>
      )}
    </>
  )
}
