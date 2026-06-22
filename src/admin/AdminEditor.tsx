import { useEffect, useState } from 'react'
import { Check, ExternalLink, LogOut, RotateCcw, Save } from 'lucide-react'
import { useContentAdmin, type SiteContent } from '@/content'
import { useAuth } from './AuthProvider'
import { SECTIONS } from './schema'
import { ObjectEditor, ListEditor } from './editors'
import { cn } from '@/lib/cn'

type Row = Record<string, unknown>

/** Deep-clean: trim and drop empty strings from string arrays before saving. */
function clean(content: SiteContent): SiteContent {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) {
      if (v.every((x) => typeof x === 'string')) {
        return (v as string[]).map((s) => s.trim()).filter(Boolean)
      }
      return v.map(walk)
    }
    if (v && typeof v === 'object') {
      const obj = v as Record<string, unknown>
      for (const k of Object.keys(obj)) obj[k] = walk(obj[k])
      return obj
    }
    return v
  }
  return walk(structuredClone(content)) as SiteContent
}

export function AdminEditor() {
  const { content, save } = useContentAdmin()
  const { user, signOut } = useAuth()

  const [draft, setDraft] = useState<SiteContent>(() => structuredClone(content))
  const [touched, setTouched] = useState(false)
  const [active, setActive] = useState<keyof SiteContent>(SECTIONS[0].key)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)

  // Sync draft with loaded content until the user starts editing.
  useEffect(() => {
    if (!touched) setDraft(structuredClone(content))
  }, [content, touched])

  const dirty = JSON.stringify(draft) !== JSON.stringify(content)
  const section = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0]

  const updateSection = (value: unknown) => {
    setTouched(true)
    setStatus('idle')
    setDraft((d) => ({ ...d, [section.key]: value }) as unknown as SiteContent)
  }

  const onSave = async () => {
    setStatus('saving')
    setErr(null)
    const cleaned = clean(draft)
    const { error } = await save(cleaned)
    if (error) {
      setStatus('error')
      setErr(error)
    } else {
      setDraft(cleaned)
      setTouched(false)
      setStatus('saved')
    }
  }

  const onReset = () => {
    setDraft(structuredClone(content))
    setTouched(false)
    setStatus('idle')
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-semibold text-ink">Portfolio CMS</span>
            {dirty ? (
              <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
                Unsaved changes
              </span>
            ) : (
              status === 'saved' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                  <Check size={13} /> Saved
                </span>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink hover:border-primary sm:inline-flex"
            >
              View site <ExternalLink size={14} />
            </a>
            {dirty && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-ink"
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || status === 'saving'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-black disabled:opacity-40"
            >
              <Save size={15} /> {status === 'saving' ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {err && <p className="bg-danger/10 px-6 py-2 text-sm text-danger">{err}</p>}
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        {/* Section nav */}
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={cn(
                  'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active === s.key ? 'bg-ink text-surface' : 'text-body hover:bg-surface',
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor */}
        <main className="min-w-0 flex-1">
          {/* Mobile section selector */}
          <select
            value={String(active)}
            onChange={(e) => setActive(e.target.value as keyof SiteContent)}
            className="mb-4 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm md:hidden"
          >
            {SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{section.label}</h2>
              <span className="text-xs text-muted">
                Signed in as {user?.email}
              </span>
            </div>

            {section.kind === 'object' ? (
              <ObjectEditor
                fields={section.fields}
                value={draft[section.key] as unknown as Row}
                onChange={updateSection}
              />
            ) : (
              <ListEditor
                items={draft[section.key] as unknown as Row[]}
                fields={section.fields}
                newItem={section.newItem}
                labelKey={section.labelKey}
                onChange={updateSection}
              />
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Changes go live for everyone the moment you press <strong>Save</strong>.
          </p>
        </main>
      </div>
    </div>
  )
}
