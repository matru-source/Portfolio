import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { GalleryImage } from './GalleryImage'

export interface LightboxItem {
  image?: string
  title: string
  subtitle?: string
  caption?: string
  file?: string
}

interface LightboxProps {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/** Accessible modal image viewer with keyboard + arrow navigation. */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null
  const current = open ? items[index] : null
  const many = items.length > 1

  const go = (delta: number) => {
    if (index === null) return
    onNavigate((index + delta + items.length) % items.length)
  }

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, items.length])

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" onClick={onClose} aria-hidden />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-surface/10 text-surface transition-colors hover:bg-surface/20"
          >
            <X size={22} />
          </button>

          {/* Prev / Next */}
          {many && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface/10 text-surface transition-colors hover:bg-surface/20 sm:left-6"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface/10 text-surface transition-colors hover:bg-surface/20 sm:right-6"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image */}
          <motion.div
            key={index}
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1] h-[68vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GalleryImage
              src={current.image}
              alt={current.title}
              label={current.title}
              className="h-full w-full rounded-xl"
              imgClassName="rounded-xl object-contain"
            />
          </motion.div>

          {/* Caption */}
          <div className="relative z-[1] mt-5 max-w-xl text-center text-surface">
            <p className="font-display text-lg font-medium">{current.title}</p>
            {current.subtitle && <p className="mt-1 text-sm text-surface/70">{current.subtitle}</p>}
            {current.caption && <p className="mt-1 text-sm text-surface/60">{current.caption}</p>}
            <div className="mt-3 flex items-center justify-center gap-4">
              {many && (
                <span className="font-mono text-xs text-surface/50">
                  {(index ?? 0) + 1} / {items.length}
                </span>
              )}
              {current.file && (
                <a
                  href={current.file}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-surface/80 hover:text-surface"
                >
                  Open file <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
