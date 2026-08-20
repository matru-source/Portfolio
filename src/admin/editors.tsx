import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  FileText,
  Folder,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MEDIA_BUCKET } from './config'
import type { FieldDef } from './schema'
import { cn } from '@/lib/cn'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'
const labelClass = 'mb-1 block text-xs font-medium text-muted'

function isPdf(url?: string | null): boolean {
  if (!url) return false
  const clean = url.split('?')[0].toLowerCase()
  return clean.endsWith('.pdf')
}

interface StorageFile {
  name: string
  folder: string
  url: string
  isPdf: boolean
  size?: number
  updatedAt?: string | null
}

/** Supabase Media Library Modal — browse and multi-select existing cloud storage files. */
function SupabaseMediaModal({
  open,
  onClose,
  onSelect,
  allowMultiple = true,
  filterType = 'all',
}: {
  open: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void
  allowMultiple?: boolean
  filterType?: 'all' | 'image' | 'pdf'
}) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<StorageFile[]>([])
  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState<string>('all')
  const [activeType, setActiveType] = useState<'all' | 'image' | 'pdf'>(filterType)
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [err, setErr] = useState<string | null>(null)

  const fetchFiles = async () => {
    if (!supabase) {
      setErr('Supabase is not configured.')
      return
    }
    setLoading(true)
    setErr(null)
    try {
      const folders = ['', 'uploads', 'gallery', 'resume']
      const allFiles: StorageFile[] = []

      for (const folder of folders) {
        const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(folder, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        })
        if (error) continue
        if (data) {
          data.forEach((item) => {
            if (item.name === '.emptyFolderPlaceholder') return
            // If it's a subfolder, ignore as a file
            if (['gallery', 'uploads', 'resume'].includes(item.name) && folder === '') return

            const filePath = folder ? `${folder}/${item.name}` : item.name
            const { data: urlData } = supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(filePath)
            const isItemPdf = item.name.toLowerCase().endsWith('.pdf')

            allFiles.push({
              name: item.name,
              folder: folder || 'root',
              url: urlData.publicUrl,
              isPdf: isItemPdf,
              size: (item.metadata as { size?: number })?.size,
              updatedAt: item.updated_at,
            })
          })
        }
      }
      setFiles(allFiles)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSelectedUrls(new Set())
      setActiveType(filterType)
      fetchFiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filterType])

  const filtered = useMemo(() => {
    return files.filter((f) => {
      if (activeFolder !== 'all' && f.folder !== activeFolder) return false
      if (activeType === 'image' && f.isPdf) return false
      if (activeType === 'pdf' && !f.isPdf) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return f.name.toLowerCase().includes(q) || f.folder.toLowerCase().includes(q)
      }
      return true
    })
  }, [files, activeFolder, activeType, search])

  const toggleSelect = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev)
      if (next.has(url)) {
        next.delete(url)
      } else {
        if (!allowMultiple) {
          next.clear()
        }
        next.add(url)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedUrls(new Set(filtered.map((f) => f.url)))
  }

  const clearAll = () => {
    setSelectedUrls(new Set())
  }

  const deleteSingle = async (item: StorageFile, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Permanently delete "${item.name}" from Supabase Cloud Storage?`)) return
    if (!supabase) return
    try {
      const filePath = item.folder && item.folder !== 'root' ? `${item.folder}/${item.name}` : item.name
      const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([filePath])
      if (error) throw error
      setFiles((prev) => prev.filter((f) => f.url !== item.url))
      setSelectedUrls((prev) => {
        const next = new Set(prev)
        next.delete(item.url)
        return next
      })
    } catch (e2) {
      alert('Delete failed: ' + (e2 instanceof Error ? e2.message : String(e2)))
    }
  }

  const deleteSelected = async () => {
    if (!selectedUrls.size) return
    if (!window.confirm(`Permanently delete ${selectedUrls.size} selected file(s) from Supabase Cloud Storage?`)) return
    if (!supabase) return
    try {
      const toDelete = files.filter((f) => selectedUrls.has(f.url))
      const paths = toDelete.map((f) =>
        f.folder && f.folder !== 'root' ? `${f.folder}/${f.name}` : f.name,
      )
      const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths)
      if (error) throw error
      setFiles((prev) => prev.filter((f) => !selectedUrls.has(f.url)))
      setSelectedUrls(new Set())
    } catch (e2) {
      alert('Bulk delete failed: ' + (e2 instanceof Error ? e2.message : String(e2)))
    }
  }

  const handleConfirm = () => {
    onSelect(Array.from(selectedUrls))
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Supabase Media Library
            </h3>
            <p className="text-xs text-muted">
              Select {allowMultiple ? 'one or more photos / documents' : 'a photo or document'}, or remove unwanted files from cloud storage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-canvas hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/40 px-6 py-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files by name…"
              className="w-full rounded-lg border border-line bg-white py-1.5 pl-8 pr-3 text-xs text-ink outline-none focus:border-primary"
            />
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1 text-xs">
            {(['all', 'image', 'pdf'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={cn(
                  'rounded px-2.5 py-1 font-medium capitalize transition-colors',
                  activeType === t ? 'bg-primary text-white' : 'text-muted hover:text-ink',
                )}
              >
                {t === 'all' ? 'All Types' : t === 'image' ? 'Images' : 'PDFs'}
              </button>
            ))}
          </div>

          {/* Folder tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1 text-xs">
            {['all', 'uploads', 'gallery', 'resume'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFolder(f)}
                className={cn(
                  'rounded px-2.5 py-1 font-medium capitalize transition-colors',
                  activeFolder === f
                    ? 'bg-primary-50 font-bold text-primary'
                    : 'text-muted hover:text-ink',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchFiles}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink hover:border-primary disabled:opacity-50"
            title="Refresh files"
          >
            <RefreshCw size={13} className={cn(loading && 'animate-spin')} /> Refresh
          </button>
        </div>

        {/* Multi-selection summary banner with Delete Selected option */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-medium text-ink">
                {selectedUrls.size} of {filtered.length} selected
              </span>
              {allowMultiple && (
                <>
                  <button type="button" onClick={selectAll} className="text-primary hover:underline">
                    Select all
                  </button>
                  <span className="text-muted">·</span>
                  <button type="button" onClick={clearAll} className="text-muted hover:text-ink hover:underline">
                    Clear
                  </button>
                </>
              )}
            </div>

            {selectedUrls.size > 0 && (
              <button
                type="button"
                onClick={deleteSelected}
                className="inline-flex items-center gap-1 font-medium text-danger hover:underline"
              >
                <Trash2 size={13} /> Delete {selectedUrls.size} from Supabase
              </button>
            )}
          </div>
        )}

        {/* Content grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {err && (
            <div className="mb-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">
              {err}
            </div>
          )}

          {loading ? (
            <div className="grid h-48 place-items-center text-sm text-muted">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin text-primary" />
                Loading Supabase files…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid h-48 place-items-center text-center text-sm text-muted">
              <div>
                <p className="font-medium">No files found.</p>
                <p className="mt-1 text-xs">Upload new files from your device to add them.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => {
                const selected = selectedUrls.has(item.url)
                return (
                  <div
                    key={item.url}
                    onClick={() => toggleSelect(item.url)}
                    className={cn(
                      'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 transition-all',
                      selected
                        ? 'border-primary bg-primary-50/20 ring-2 ring-primary/20'
                        : 'border-line bg-canvas/40 hover:border-primary/50',
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
                      {item.isPdf ? (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-rose-50/80 p-2 text-center text-rose-600">
                          <FileText size={28} />
                          <span className="rounded bg-rose-200 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-800">
                            PDF
                          </span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      )}

                      {/* Checkbox indicator */}
                      <div
                        className={cn(
                          'absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md border shadow-sm transition-all',
                          selected
                            ? 'border-primary bg-primary text-white'
                            : 'border-white/60 bg-black/40 text-transparent group-hover:text-white/60',
                        )}
                      >
                        <Check size={14} />
                      </div>

                      {/* Delete from Supabase Button */}
                      <button
                        type="button"
                        onClick={(e) => deleteSingle(item, e)}
                        title="Delete from Supabase storage permanently"
                        className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-md bg-black/50 text-white/80 opacity-0 shadow-sm transition-all hover:bg-danger hover:text-white group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Folder tag */}
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                        {item.folder}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="p-2">
                      <p
                        className="truncate text-[11px] font-medium text-ink"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-canvas/40 px-6 py-4">
          <span className="text-xs text-muted">
            {selectedUrls.size} item{selectedUrls.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedUrls.size === 0}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              Insert Selected ({selectedUrls.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Image / Document field — upload from device (Image or PDF) OR select from Supabase Storage. */
function ImageField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const url = typeof value === 'string' ? value : ''
  const isDocPdf = isPdf(url)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {/* Preview box */}
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
          {url ? (
            isDocPdf ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-rose-50/80 p-2 text-center text-rose-600">
                <FileText size={22} />
                <span className="rounded bg-rose-200 px-1 py-0.5 font-mono text-[9px] font-bold text-rose-800">
                  PDF DOC
                </span>
                <span className="line-clamp-1 max-w-[90%] text-[9px] text-ink">
                  {decodeURIComponent(url.split('/').pop() || '')}
                </span>
              </div>
            ) : (
              <img src={url} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="grid h-full w-full place-items-center text-[10px] text-muted">
              No image / file
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* Action buttons: 1) Device Upload, 2) Supabase Library */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-primary">
              <Upload size={14} /> {busy ? 'Uploading…' : 'Upload from Device (Image / PDF)'}
              <input
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="hidden"
                onChange={onFile}
                disabled={busy}
              />
            </label>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-primary hover:border-primary hover:bg-primary-50/30"
            >
              <Folder size={14} /> Select from Supabase
            </button>

            {url && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
              >
                <X size={13} /> Remove
              </button>
            )}
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste image / PDF URL"
            className={inputClass}
          />
          {err && <p className="text-xs text-danger">{err}</p>}
        </div>
      </div>

      {/* Supabase Media Modal */}
      <SupabaseMediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allowMultiple={false}
        onSelect={(urls) => {
          if (urls[0]) onChange(urls[0])
        }}
      />
    </div>
  )
}

/** Multi-image & PDF uploader — upload multiple files, browse Supabase with multi-select, reorder, delete. */
function MultiImageField({
  value,
  onChange,
}: {
  value: unknown
  onChange: (v: unknown) => void
}) {
  const images = Array.isArray(value)
    ? value.filter((x): x is string => typeof x === 'string' && Boolean(x))
    : []
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

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
      {/* 2 Choice Upload Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:border-primary">
          <Upload size={14} /> {busy ? 'Uploading…' : 'Upload from Device (Multi-Select)'}
          <input
            type="file"
            accept="image/*,application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={onFiles}
            disabled={busy}
          />
        </label>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-primary hover:border-primary hover:bg-primary-50/30"
        >
          <Folder size={14} /> Select from Supabase (Multi-Select)
        </button>

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
            placeholder="…or paste image / PDF URL"
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

      {/* Preview Grid */}
      {images.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted">
              {images.length} photo{images.length === 1 ? '' : 's'} / documents
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
            >
              <Trash2 size={12} /> Remove all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((url, i) => {
              const isDocPdf = isPdf(url)
              return (
                <div
                  key={url + i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
                >
                  {isDocPdf ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-rose-50/80 p-2 text-center text-rose-600">
                      <FileText size={24} />
                      <span className="rounded bg-rose-200 px-1 py-0.5 font-mono text-[9px] font-bold text-rose-800">
                        PDF DOC
                      </span>
                      <span className="line-clamp-1 max-w-[90%] text-[9px] text-ink">
                        {decodeURIComponent(url.split('/').pop() || '')}
                      </span>
                    </div>
                  ) : (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}

                  {/* Top-right prominent Delete button */}
                  <button
                    type="button"
                    onClick={() => removeImg(i)}
                    className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-danger text-white shadow-md transition-transform hover:scale-110 hover:bg-danger-600"
                    title="Remove this photo from item"
                  >
                    <X size={13} />
                  </button>

                  {/* Top-left Index Badge */}
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-ink/75 px-1.5 py-0.5 font-mono text-[9px] font-medium text-white shadow-sm">
                    #{i + 1}
                  </span>

                  {/* Bottom reorder arrows */}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-ink/70 px-2 py-1 backdrop-blur-xs">
                    <span className="truncate pr-1 font-mono text-[9px] text-white/80">
                      {isDocPdf ? 'PDF Document' : 'Photo'}
                    </span>
                    <div className="flex items-center gap-1">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => move(i, i - 1)}
                          className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-white hover:text-ink"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {i < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => move(i, i + 1)}
                          className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-white hover:text-ink"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted">
          No extra photos or documents added yet. Upload from device or choose multiple items directly from Supabase.
        </p>
      )}

      {/* Supabase Media Modal */}
      <SupabaseMediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allowMultiple={true}
        onSelect={(selected) => {
          const newSet = new Set([...images, ...selected])
          onChange(Array.from(newSet))
        }}
      />
    </div>
  )
}

/** File field — upload a PDF (e.g. résumé) to Supabase Storage, or paste a URL. */
function FileField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const url = typeof value === 'string' ? value : ''
  const fileName = url ? decodeURIComponent(url.split('/').pop() || 'file') : ''
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:border-primary">
          <Upload size={14} /> {busy ? 'Uploading…' : 'Upload PDF'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onFile}
            disabled={busy}
          />
        </label>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-primary hover:border-primary hover:bg-primary-50/30"
        >
          <Folder size={14} /> Select from Supabase
        </button>

        {url && (
          <>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <FileText size={13} /> {fileName}
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
        placeholder="…or paste a PDF / file URL"
        className={inputClass}
      />
      {err && <p className="text-xs text-danger">{err}</p>}

      <SupabaseMediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allowMultiple={false}
        filterType="pdf"
        onSelect={(urls) => {
          if (urls[0]) onChange(urls[0])
        }}
      />
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
