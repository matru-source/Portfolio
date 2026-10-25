import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
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

export function MessagesView() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
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

      if (error) throw error
      setMessages((data as ContactMessage[]) || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErr(
        msg.includes('relation "public.messages" does not exist')
          ? 'The "messages" table has not been created yet in Supabase. Run supabase/schema.sql in your Supabase SQL editor.'
          : msg,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return
    if (!supabase) return
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)))
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

      {err && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-xs text-danger">
          <p className="font-semibold">Setup notice:</p>
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
