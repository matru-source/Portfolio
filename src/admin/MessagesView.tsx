import { useEffect, useState } from 'react'
import { Mail, RefreshCw, Trash2, User } from 'lucide-react'
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
    if (!window.confirm('Delete this message?')) return
    if (!supabase) return
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

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
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs text-muted">
            {messages.length} contact form submission{messages.length === 1 ? '' : 's'} received
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMessages}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-primary disabled:opacity-50"
        >
          <RefreshCw size={13} className={cn(loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-xs text-danger">
          <p className="font-semibold">Setup notice:</p>
          <p className="mt-1">{err}</p>
        </div>
      )}

      {loading ? (
        <div className="grid h-48 place-items-center text-sm text-muted">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin text-primary" />
            Loading messages…
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="grid h-48 place-items-center rounded-xl border border-line bg-white p-6 text-center text-sm text-muted">
          <div>
            <p className="font-medium text-ink">No messages received yet.</p>
            <p className="mt-1 text-xs">When visitors submit the contact form, their inquiries will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-line bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-primary">
                    <User size={16} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{m.name}</p>
                    <a
                      href={`mailto:${m.email}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {m.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">{formatTime(m.created_at)}</span>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Portfolio inquiry')}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink hover:border-primary hover:text-primary"
                  >
                    <Mail size={12} /> Reply
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteMessage(m.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-danger hover:bg-danger/10"
                    title="Delete message"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="mt-3.5 whitespace-pre-wrap text-sm leading-relaxed text-body">
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
