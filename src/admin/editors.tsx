import { useState, type ChangeEvent } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, FileText, Plus, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MEDIA_BUCKET } from './config'
import type { FieldDef } from './schema'
import { cn } from '@/lib/cn'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'
const labelClass = 'mb-1 block text-xs font-medium text-muted'

/** Image field — upload to Supabase Storage (Media bucket) or paste a URL. */
function ImageField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const url = typeof value === 'string' ? value : ''
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!supabase) {
      setErr('Supabase is not configured.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const path = `uploads/${Date.now()}-${safe}`
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (error) throw error
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : String(e2)
      setErr(
        msg.toLowerCase().includes('fetch')
          ? 'Upload blocked. Check: (1) you ran supabase/schema.sql, (2) a bucket named "Media" exists, (3) disable ad/privacy blockers for this site.'
          : msg,
      )
    } finally {
      setBusy(false)
      // Allow re-selecting the same file after an error.
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
          {url ? (
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-[10px] text-muted">No image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink hover:border-primary">
            <Upload size={15} /> {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="ml-2 inline-flex items-center gap-1 text-xs text-danger hover:underline"
            >
              <X size={13} /> Remove
            </button>
          )}
          <input
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className={inputClass}
          />
          {err && <p className="text-xs text-danger">{err}</p>}
        </div>
      </div>
    </div>
  )
}

/** Multi-image uploader — upload multiple photos at once, add via URL, reorder, delete. */
function MultiImageField({
  value,
  onChange,
}: {
  value: unknown
  onChange: (v: unknown) => void
}) {
  const images = Array.isArray(value)
    ? (value.filter((x): x is string => typeof x === 'string' && Boolean(x)))
    : []
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [newUrl, setNewUrl] = useState('')

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (!supabase) {
      setErr('Supabase is not configured.')
      return
    }
    setBusy(true)
    setErr(null)
    const uploadedUrls: string[] = []
    try {
      for (const file of files) {
        const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const path = `gallery/${Date.now()}-${safe}`
        const { error } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, { upsert: true, cacheControl: '3600' })
        if (error) throw error
        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }
      onChange([...images, ...uploadedUrls])
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : String(e2)
      setErr(
        msg.toLowerCase().includes('fetch')
          ? 'Upload blocked. Check Supabase schema & storage bucket.'
          : msg,
      )
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const addUrl = () => {
    if (!newUrl.trim()) return
    onChange([...images, newUrl.trim()])
    setNewUrl('')
  }

  const removeImg = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const copy = [...images]
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    onChange(copy)
  }

  return (
    <div className="space-y-3 rounded-lg border border-line bg-canvas/60 p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink hover:border-primary">
          <Upload size={15} /> {busy ? 'Uploading…' : 'Upload photos (multi-select)'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFiles}
            disabled={busy}
          />
        </label>
        <div className="flex min-w-[240px] flex-1 items-center gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
            placeholder="…or paste image URL and press Enter"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={!newUrl.trim()}
            className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:border-primary disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {err && <p className="text-xs text-danger">{err}</p>}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url + i}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-between bg-ink/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      className="rounded bg-surface/90 px-1.5 py-0.5 text-[10px] font-bold text-ink hover:bg-surface"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => move(i, i + 1)}
                      className="rounded bg-surface/90 px-1.5 py-0.5 text-[10px] font-bold text-ink hover:bg-surface"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImg(i)}
                  className="rounded bg-danger p-1 text-white hover:opacity-90"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">
          No extra photos added yet. Upload or paste multiple images to cycle automatically every 2s.
        </p>
      )}
    </div>
  )
}

/** File field — upload a PDF (e.g. résumé) to Supabase Storage, or paste a URL. */
function FileField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const url = typeof value === 'string' ? value : ''
  const fileName = url ? decodeURIComponent(url.split('/').pop() || 'file') : ''
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!supabase) {
      setErr('Supabase is not configured.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const path = `resume/${Date.now()}-${safe}`
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (error) throw error
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : String(e2)
      setErr(
        msg.toLowerCase().includes('fetch')
          ? 'Upload blocked. Run supabase/schema.sql, ensure a "Media" bucket exists, and disable ad/privacy blockers.'
          : msg,
      )
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink hover:border-primary">
          <Upload size={15} /> {busy ? 'Uploading…' : 'Upload PDF'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onFile}
            disabled={busy}
          />
        </label>
        {url && (
          <>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <FileText size={14} /> {fileName}
            </a>
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
            >
              <X size={13} /> Remove
            </button>
          </>
        )}
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a PDF URL"
        className={inputClass}
        aria-label="Résumé URL"
      />
      {err && <p className="text-xs text-danger">{err}</p>}
    </div>
  )
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          aria-label={field.label}
          rows={4}
          className={cn(inputClass, 'resize-y')}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'number':
      return (
        <input
          aria-label={field.label}
          type="number"
          className={inputClass}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )
    case 'toggle':
      return (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {field.label}
        </label>
      )
    case 'select':
      return (
        <select
          aria-label={field.label}
          className={inputClass}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )
    case 'stringList':
      return (
        <textarea
          aria-label={field.label}
          rows={4}
          className={cn(inputClass, 'resize-y font-mono text-xs')}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n'))}
        />
      )
    case 'image':
      return <ImageField value={value} onChange={onChange} />
    case 'images':
      return <MultiImageField value={value} onChange={onChange} />
    case 'file':
      return <FileField value={value} onChange={onChange} />
    default:
      return (
        <input
          aria-label={field.label}
          type="text"
          className={inputClass}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}

type Row = Record<string, unknown>

export function ObjectEditor({
  fields,
  value,
  onChange,
}: {
  fields: FieldDef[]
  value: Row
  onChange: (v: Row) => void
}) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        if (f.type === 'sublist') {
          return (
            <div key={f.key} className="sm:col-span-2">
              <label className={labelClass}>{f.label}</label>
              <ListEditor
                items={Array.isArray(value[f.key]) ? (value[f.key] as Row[]) : []}
                fields={f.subFields ?? []}
                newItem={f.newItem}
                onChange={(items) => set(f.key, items)}
              />
            </div>
          )
        }
        if (f.type === 'toggle') {
          return (
            <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
              <Field field={f} value={value[f.key]} onChange={(v) => set(f.key, v)} />
            </div>
          )
        }
        return (
          <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
            <label className={labelClass}>{f.label}</label>
            <Field field={f} value={value[f.key]} onChange={(v) => set(f.key, v)} />
          </div>
        )
      })}
    </div>
  )
}

export function ListEditor({
  items,
  fields,
  newItem,
  labelKey,
  onChange,
}: {
  items: Row[]
  fields: FieldDef[]
  newItem?: () => Row
  labelKey?: string
  onChange: (items: Row[]) => void
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const update = (i: number, obj: Row) => onChange(items.map((it, idx) => (idx === i ? obj : it)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: number) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const copy = [...items]
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
    onChange(copy)
  }
  const add = () => {
    onChange([...items, newItem ? newItem() : {}])
    setOpenIdx(items.length)
  }

  const titleOf = (it: Row) =>
    String(
      (labelKey && it[labelKey]) || it.title || it.name || it.label || it.org || 'Untitled',
    )

  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const open = openIdx === i
        return (
          <div key={(it.key as string) ?? i} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <ChevronDown
                  size={15}
                  className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')}
                />
                <span className="truncate text-sm font-medium text-ink">{titleOf(it)}</span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-canvas hover:text-ink">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-canvas hover:text-ink">
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => remove(i)} aria-label="Delete" className="grid h-7 w-7 place-items-center rounded text-danger hover:bg-danger/10">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {open && (
              <div className="border-t border-line p-3">
                <ObjectEditor fields={fields} value={it} onChange={(obj) => update(i, obj)} />
              </div>
            )}
          </div>
        )
      })}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-primary hover:border-primary"
      >
        <Plus size={15} /> Add item
      </button>
    </div>
  )
}
