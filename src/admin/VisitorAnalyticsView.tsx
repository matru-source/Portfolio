import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Smartphone,
  Trash2,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

interface VisitorLog {
  id: string
  ip: string
  city: string
  region: string
  country: string
  country_code: string
  flag: string
  isp: string
  page: string
  device: string
  browser: string
  created_at: string
}

const VISITOR_LOGS_SQL = `-- 1) Create visitor_logs table in Supabase
create table if not exists public.visitor_logs (
  id           uuid primary key default gen_random_uuid(),
  ip           text,
  city         text,
  region       text,
  country      text,
  country_code text,
  flag         text,
  isp          text,
  page         text,
  user_agent   text,
  device       text,
  browser      text,
  created_at   timestamptz not null default now()
);

alter table public.visitor_logs enable row level security;

-- 2) Allow anyone (public visitors) to log visits
drop policy if exists "anyone can log visit" on public.visitor_logs;
create policy "anyone can log visit"
  on public.visitor_logs for insert
  to anon, authenticated
  with check (true);

-- 3) Allow admins to view visitor logs
drop policy if exists "admins read visit logs" on public.visitor_logs;
create policy "admins read visit logs"
  on public.visitor_logs for select
  to authenticated
  using ( lower(auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );

-- 4) Allow admins to delete visitor logs
drop policy if exists "admins delete visit logs" on public.visitor_logs;
create policy "admins delete visit logs"
  on public.visitor_logs for delete
  to authenticated
  using ( lower(auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );

-- 5) Reload Supabase schema cache
notify pgrst, 'reload schema';`

function parseErrorMessage(e: unknown): string {
  if (!e) return 'Unknown error'
  if (typeof e === 'string') return e
  if (typeof e === 'object') {
    const obj = e as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.error_description === 'string') return obj.error_description
    try {
      return JSON.stringify(e)
    } catch {
      return String(e)
    }
  }
  return String(e)
}

export function VisitorAnalyticsView() {
  const [logs, setLogs] = useState<VisitorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [err, setErr] = useState<string | null>(null)
  const [isTableMissing, setIsTableMissing] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  const fetchLogs = async () => {
    if (!supabase) {
      setErr('Supabase is not configured.')
      setLoading(false)
      return
    }
    setLoading(true)
    setErr(null)
    try {
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(250)

      if (error) {
        const msg = parseErrorMessage(error)
        const code = (error as { code?: string }).code
        const lower = msg.toLowerCase()
        if (
          code === '42P01' ||
          code === 'PGRST204' ||
          code === 'PGRST205' ||
          lower.includes('schema cache') ||
          lower.includes('could not find the table') ||
          lower.includes('relation') ||
          lower.includes('does not exist')
        ) {
          setIsTableMissing(true)
          setLogs([])
          return
        }
        throw new Error(msg)
      }

      setIsTableMissing(false)
      setLogs((data as VisitorLog[]) || [])
    } catch (e) {
      const msg = parseErrorMessage(e)
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(VISITOR_LOGS_SQL)
      setCopiedSql(true)
      setTimeout(() => setCopiedSql(false), 2500)
    } catch {
      // fallback
    }
  }

  const clearAllLogs = async () => {
    if (!logs.length) return
    if (!window.confirm(`Delete all ${logs.length} visitor logs permanently?`)) return
    if (!supabase) return
    try {
      const ids = logs.map((l) => l.id)
      const { error } = await supabase.from('visitor_logs').delete().in('id', ids)
      if (error) throw new Error(parseErrorMessage(error))
      setLogs([])
    } catch (e) {
      alert('Failed to clear logs: ' + parseErrorMessage(e))
    }
  }

  // Summary statistics
  const stats = useMemo(() => {
    const total = logs.length
    const countries = new Set(logs.map((l) => l.country).filter(Boolean))
    const cities: Record<string, number> = {}
    let desktop = 0
    let mobile = 0

    logs.forEach((l) => {
      if (l.city && l.city !== 'Unknown') {
        const key = `${l.city}, ${l.country_code || l.country}`
        cities[key] = (cities[key] || 0) + 1
      }
      if (l.device === 'Mobile') mobile++
      else desktop++
    })
    const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]

    return {
      total,
      uniqueCountries: countries.size,
      topCityName: topCity ? topCity[0] : 'None yet',
      topCityCount: topCity ? topCity[1] : 0,
      desktop,
      mobile,
    }
  }, [logs])

  // Filtered logs
  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        !search.trim() ||
        l.city?.toLowerCase().includes(search.toLowerCase()) ||
        l.region?.toLowerCase().includes(search.toLowerCase()) ||
        l.country?.toLowerCase().includes(search.toLowerCase()) ||
        l.ip?.toLowerCase().includes(search.toLowerCase()) ||
        l.isp?.toLowerCase().includes(search.toLowerCase()) ||
        l.page?.toLowerCase().includes(search.toLowerCase())

      const matchesCountry = countryFilter === 'all' || l.country === countryFilter

      return matchesSearch && matchesCountry
    })
  }, [logs, search, countryFilter])

  // Country options for dropdown
  const countryList = useMemo(() => {
    const set = new Set<string>()
    logs.forEach((l) => {
      if (l.country && l.country !== 'Unknown') set.add(l.country)
    })
    return Array.from(set).sort()
  }, [logs])

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-5">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
              <Users size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Total Visits</p>
              <p className="font-display text-2xl font-bold text-ink">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
              <Globe size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Countries</p>
              <p className="font-display text-2xl font-bold text-ink">{stats.uniqueCountries}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
              <MapPin size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Top Location</p>
              <p className="truncate font-display text-base font-bold text-ink" title={stats.topCityName}>
                {stats.topCityName}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
              <Monitor size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Devices</p>
              <p className="font-display text-xs font-semibold text-ink">
                {stats.desktop} Desktop · {stats.mobile} Mobile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Setup Notice banner if table is missing */}
      {isTableMissing && (
        <div className="card border-warning/40 bg-warning/5 p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-warning animate-pulse" />
                <h3 className="font-display text-base font-semibold text-ink">
                  One-Time Supabase Setup Required
                </h3>
              </div>
              <p className="mt-1 text-xs text-body leading-relaxed max-w-2xl">
                The <code className="rounded bg-canvas px-1.5 py-0.5 font-mono font-semibold text-ink">visitor_logs</code> table hasn&apos;t been created in your Supabase project yet.
                Click <strong>&quot;Copy SQL Script&quot;</strong>, open your Supabase SQL editor, paste and run it.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={copySql}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-medium text-surface transition hover:bg-black"
              >
                {copiedSql ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:border-primary"
              >
                Supabase <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-line bg-canvas">
            <div className="flex items-center justify-between border-b border-line/60 bg-surface/50 px-3 py-1.5 text-[11px] font-mono text-muted">
              <span>SQL Query (supabase/schema.sql)</span>
              <span>PostgreSQL</span>
            </div>
            <pre className="max-h-44 overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-ink/80">
              {VISITOR_LOGS_SQL}
            </pre>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
            <ol className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <li>1. Copy SQL</li>
              <li>➔ 2. Paste in Supabase SQL Editor &amp; Run</li>
              <li>➔ 3. Click Refresh below</li>
            </ol>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-primary disabled:opacity-50"
            >
              <RefreshCw size={13} className={cn(loading && 'animate-spin')} /> I have run the SQL, Refresh Now
            </button>
          </div>
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-xs leading-relaxed text-danger">
          <p className="font-semibold">Notice:</p>
          <p className="mt-1">{err}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 card p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, country, page, or ISP…"
            className="w-full rounded-lg border border-line bg-canvas/30 py-1.5 pl-8 pr-3 text-xs text-ink outline-hidden focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {countryList.length > 1 && (
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-hidden focus:border-primary"
            >
              <option value="all">All Countries ({countryList.length})</option>
              {countryList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-primary disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={13} className={cn(loading && 'animate-spin')} /> Refresh
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={clearAllLogs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 bg-white px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
              title="Clear all logs"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Data display */}
      {loading ? (
        <div className="card grid h-56 place-items-center text-sm text-muted">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin text-primary" />
            Loading visitor analytics…
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card grid h-56 place-items-center p-6 text-center text-sm text-muted">
          <div>
            <Globe size={32} className="mx-auto mb-2 text-muted/50" />
            <p className="font-medium text-ink">
              {search ? 'No visits match your search.' : 'No visitor records yet.'}
            </p>
            <p className="mt-1 text-xs">
              {search
                ? 'Try a different keyword or clear the search filter.'
                : 'Visitor locations (City, Country, ISP, Device) will appear here automatically when visitors browse your portfolio!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas/40 font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Network / ISP</th>
                  <th className="px-4 py-3">Device &amp; Browser</th>
                  <th className="px-4 py-3">Landing Page</th>
                  <th className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filtered.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-canvas/30">
                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {log.flag ? (
                          <img
                            src={log.flag}
                            alt={log.country}
                            className="h-3.5 w-5 rounded-xs object-cover shadow-2xs"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <MapPin size={14} className="text-muted" />
                        )}
                        <div>
                          <p className="font-semibold text-ink">
                            {log.city || 'Unknown City'}
                            {log.region && log.region !== log.city ? `, ${log.region}` : ''}
                          </p>
                          <p className="text-[11px] text-muted">{log.country || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Network / ISP */}
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate font-medium text-body" title={log.isp}>
                        {log.isp || 'Unknown ISP'}
                      </p>
                      <p className="font-mono text-[10px] text-muted">{log.ip || '—'}</p>
                    </td>

                    {/* Device & Browser */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {log.device === 'Mobile' ? (
                          <Smartphone size={13} className="text-muted" />
                        ) : (
                          <Monitor size={13} className="text-muted" />
                        )}
                        <span className="font-medium text-body">{log.device || 'Desktop'}</span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">{log.browser || 'Browser'}</span>
                      </div>
                    </td>

                    {/* Page */}
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-canvas px-2 py-0.5 font-mono text-[11px] text-ink">
                        {log.page || '/'}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-muted whitespace-nowrap">
                      {formatTime(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
