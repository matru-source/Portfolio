import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui'
import { useContent } from '@/content'
import { supabase } from '@/lib/supabase'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const fieldClass =
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary'

export function ContactForm() {
  const { profile } = useContent()
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const openMail = () => {
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // No backend configured → open the visitor's email client.
    if (!supabase) {
      openMail()
      return
    }

    setStatus('sending')
    try {
      const { error } = await supabase
        .from('messages')
        .insert({ name: form.name, email: form.email, message: form.message })
      if (error) throw error
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      // Never lose the message — fall back to the email client.
      setStatus('error')
      openMail()
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={onChange}
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@company.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={onChange}
          placeholder="Tell me about the role or project…"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'} <Send size={16} />
        </Button>
        {status === 'sent' && (
          <span className="text-sm text-success">Thanks — your message was sent. I’ll reply soon.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-muted">Opening your email app instead…</span>
        )}
      </div>
    </form>
  )
}
