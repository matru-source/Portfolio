import { useEffect, useMemo, useState } from 'react'
import {
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

export function VisitorAnalyticsView() {
  const [logs, setLogs] = useState<VisitorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [err, setErr] = useState<string | null>(null)

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
        // Table might not exist yet if schema.sql was not run in Supabase SQL editor
        throw error
      }
      setLogs((data as VisitorLog[]) || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErr(
        msg.includes('relation "public.visitor_logs" does not exist')
          ? 'The "visitor_logs" table has not been created yet in Supabase. Run the SQL script from supabase/schema.sql in your Supabase SQL Editor.'
          : msg,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const clearAllLogs = async () => {
    if (!logs.length) return
    if (!window.confirm(`Delete all ${logs.length} visitor logs?`)) return
    if (!supabase) return
    try {
      const ids = logs.map((l) => l.id)
      const { error } = await supabase.from('visitor_logs').delete().in('id', ids)
      if (error) throw error
      setLogs([])
    } catch (e) {
      alert('Failed to clear logs: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  // Summary statistics
  const stats = useMemo(() => {
    const total = logs.length
    const countries = new Set(logs.map((l) => l.country).filter(Boolean))
    const cities: Record<string, number> = {}
    logs.forEach((l) => {
      if (l.city && l.city !== 'Unknown') {
        const key = `${l.city}, ${l.country_code || l.country}`
        cities[key] = (cities[key] || 0) + 1
      }
    })
    const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]

    return {
      total,
      uniqueCountries: countries.size,
      topCityName: topCity ? topCity[0] : 'None yet',
      topCityCount: topCity ? topCity[1] : 0,
    }
  }, [logs])

  // Filtered logs
  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (countryFilter !== 'all' && l.country !== countryFilter) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        l.city?.toLowerCase().includes(q) ||
        l.country?.toLowerCase().includes(q) ||
        l.region?.toLowerCase().includes(q) ||
        l.page?.toLowerCase().includes(q) ||
        l.isp?.toLowerCase().includes(q)
      )
    })
  }, [logs, search, countryFilter])

  const countryList = useMemo(() => {
    const list = Array.from(new Set(logs.map((l) => l.country).filter(Boolean)))
    return list.sort()
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
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
              <Users size={18} />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Total Visits</p>
              <p className="font-display text-2xl font-bold text-ink">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
              <Globe size={18} />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Unique Countries</p>
              <p className="font-display text-2xl font-bold text-ink">{stats.uniqueCountries}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
              <MapPin size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Top Location</p>
              <p className="truncate font-display text-lg font-bold text-ink" title={stats.topCityName}>
                {stats.topCityName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-xs leading-relaxed text-danger">
          <p className="font-semibold">Setup required:</p>
          <p className="mt-1">{err}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-3 shadow-xs">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, country, page, or ISP…"
            className="w-full rounded-lg border border-line bg-canvas/30 py-1.5 pl-8 pr-3 text-xs text-ink outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {countryList.length > 1 && (
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-primary hover:bg-canvas disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={13} className={cn(loading && 'animate-spin')} /> Refresh
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={clearAllLogs}
              className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
              title="Delete all visitor logs"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Visitors List / Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xs">
        {loading ? (
          <div className="grid h-48 place-items-center text-sm text-muted">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="animate-spin text-primary" />
              Loading visitor location records…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid h-48 place-items-center p-6 text-center text-sm text-muted">
            <div>
              <p className="font-medium text-ink">No visitor records yet.</p>
              <p className="mt-1 text-xs text-muted">
                Visitor locations (City, Country, ISP, Device) will appear here automatically when visitors browse your portfolio!
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas/40 font-mono uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Network / ISP</th>
                  <th className="px-4 py-3 font-medium">Page Visited</th>
                  <th className="px-4 py-3 font-medium">Device & Browser</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-canvas/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.flag ? (
                          <img
                            src={item.flag}
                            alt=""
                            className="h-3.5 w-5 rounded-xs object-cover shadow-xs"
                          />
                        ) : (
                          <span className="grid h-4 w-4 place-items-center text-muted">
                            <MapPin size={13} />
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-ink">
                            {item.city && item.city !== 'Unknown' ? item.city : 'Unknown city'}
                            {item.region ? `, ${item.region}` : ''}
                          </p>
                          <p className="text-[11px] text-muted">{item.country}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-body">
                      <span className="truncate block max-w-[160px]" title={item.isp}>
                        {item.isp || '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-primary">
                      {item.page || '/'}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas/50 px-2 py-0.5 text-[11px] text-ink">
                        {item.device === 'Mobile' ? (
                          <Smartphone size={12} className="text-muted" />
                        ) : (
                          <Monitor size={12} className="text-muted" />
                        )}
                        {item.device} · {item.browser}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-muted">
                      {formatTime(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
