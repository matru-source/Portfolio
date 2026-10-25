import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Inbox,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export const MESSAGES_SQL = `-- 1) Create messages table in Supabase
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- 2) Allow anyone (public visitors) to submit messages
drop policy if exists "anyone can submit message" on public.messages;
create policy "anyone can submit message"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- 3) Allow admins to view messages
drop policy if exists "admins read messages" on public.messages;
create policy "admins read messages"
  on public.messages for select
  to authenticated
  using ( lower(auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );

-- 4) Allow admins to delete messages
drop policy if exists "admins delete messages" on public.messages;
create policy "admins delete messages"
  on public.messages for delete
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

export function MessagesView() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedSql, setCopiedSql] = useState(false)
  const [isTableMissing, setIsTableMissing] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const fetchMessages = async () => {
    if (!supabase) {
      setErr('Supabase is not configured.')
      setLoading(false)
      return
    }
    setLoading(true)
    setErr(null)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

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
          setMessages([])
          return
        }
        throw new Error(msg)
      }

      setIsTableMissing(false)
      setMessages((data as ContactMessage[]) || [])
    } catch (e) {
      const msg = parseErrorMessage(e)
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(MESSAGES_SQL)
      setCopiedSql(true)
      setTimeout(() => setCopiedSql(false), 2500)
    } catch {
      // fallback
    }
  }

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return
    if (!supabase) return
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw new Error(parseErrorMessage(error))
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert('Delete failed: ' + parseErrorMessage(e))
    }
  }

  const copyEmail = async (id: string, email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    )
  }, [messages, search])

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Controls & Search Bar */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-ink">Messages Inbox</h2>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                {messages.length} total
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Inquiries and messages submitted by portfolio visitors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMessages}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-primary disabled:opacity-50"
            >
              <RefreshCw size={13} className={cn(loading && 'animate-spin')} /> Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs">
          <Search size={14} className="text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages by name, email, or message keyword…"
            className="w-full bg-transparent text-ink placeholder:text-muted focus:outline-hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs text-muted hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Database Setup Notice banner if messages table is missing */}
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
                The <code className="rounded bg-canvas px-1.5 py-0.5 font-mono font-semibold text-ink">messages</code> table hasn&apos;t been created in your Supabase project yet.
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
              {MESSAGES_SQL}
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
              onClick={fetchMessages}
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

      {loading ? (
        <div className="card grid h-48 place-items-center text-sm text-muted">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin text-primary" />
            Loading messages…
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card grid h-48 place-items-center p-6 text-center text-sm text-muted">
          <div>
            <Inbox size={28} className="mx-auto mb-2 text-muted/60" />
            <p className="font-medium text-ink">
              {search ? 'No messages match your search.' : 'No messages received yet.'}
            </p>
            <p className="mt-1 text-xs">
              {search
                ? 'Try searching for something else.'
                : 'When visitors submit the contact form, their inquiries will appear here automatically.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary">
                    <User size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-bold text-ink">{m.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${m.email}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {m.email}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyEmail(m.id, m.email)}
                        className="text-muted hover:text-ink"
                        title="Copy email address"
                      >
                        {copiedId === m.id ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">{formatTime(m.created_at)}</span>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Portfolio inquiry')}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-surface transition-colors hover:bg-black"
                  >
                    <Mail size={13} /> Reply
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteMessage(m.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap rounded-lg bg-canvas/60 p-3.5 text-sm leading-relaxed text-body">
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
