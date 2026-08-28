import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Layers } from 'lucide-react'
import { Reveal, Badge } from '@/components/ui'
import { cn } from '@/lib/cn'
import { GalleryImage } from './GalleryImage'
import { Lightbox, type LightboxItem } from './Lightbox'

export interface GalleryEntry extends LightboxItem {
  date?: string
  tags?: string[]
}

interface GalleryProps {
  items: GalleryEntry[]
  aspect?: 'photo' | 'square' | 'wide'
  columns?: 2 | 3 | 4
}

const aspectClass: Record<NonNullable<GalleryProps['aspect']>, string> = {
  photo: 'aspect-[4/3]',
  square: 'aspect-square',
  wide: 'aspect-[16/10]',
}

const colClass: Record<NonNullable<GalleryProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

function GalleryCardItem({
  item,
  aspect,
  onOpen,
}: {
  item: GalleryEntry
  aspect: NonNullable<GalleryProps['aspect']>
  onOpen: () => void
}) {
  const images = useMemo(() => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      const list = item.images.filter(Boolean)
      if (list.length > 0) return list
    }
    return item.image ? [item.image] : []
  }, [item.image, item.images])

  const [activeIdx, setActiveIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const hasMultiple = images.length > 1

  // 2-second automatic slideshow when multiple photos are available
  useEffect(() => {
    if (!hasMultiple || hovered) return

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [hasMultiple, hovered, images.length])

  const currentSrc = images[activeIdx] || item.image

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`View ${item.title}`}
      className="group block w-full text-left"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-line bg-canvas',
          aspectClass[aspect],
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 h-full w-full"
          >
            <GalleryImage
              src={currentSrc}
              alt={`${item.title} ${hasMultiple ? `(${activeIdx + 1}/${images.length})` : ''}`}
              label={item.title}
              className="h-full w-full"
              imgClassName="transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Hover overlay with maximize icon */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/25 group-hover:opacity-100">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-surface text-ink shadow-sm">
            <Maximize2 size={18} />
          </span>
        </div>

        {/* Date badge */}
        {item.date && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-surface/90 px-2.5 py-1 font-mono text-[10px] font-medium text-ink shadow-sm">
            {item.date}
          </span>
        )}

        {/* Multiple photos indicator & mini progress dots */}
        {hasMultiple && (
          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 backdrop-blur-sm shadow-sm">
            <Layers size={11} className="text-white/80" />
            <span className="font-mono text-[10px] font-medium text-white/95">
              {activeIdx + 1}/{images.length}
            </span>
            <div className="ml-1 flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    idx === activeIdx ? 'w-3 bg-white' : 'w-1.5 bg-white/40',
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="font-display font-medium text-ink transition-colors group-hover:text-primary">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted">
            {item.subtitle}
          </p>
        )}
        {item.caption && <p className="mt-1 text-sm text-body">{item.caption}</p>}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

/** Responsive thumbnail grid that opens an accessible lightbox. */
export function Gallery({ items, aspect = 'photo', columns = 3 }: GalleryProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <div className={cn('grid grid-cols-1 gap-6', colClass[columns])}>
        {items.map((item, i) => (
          <Reveal key={item.title + i} delay={(i % 3) * 0.06}>
            <GalleryCardItem
              item={item}
              aspect={aspect}
              onOpen={() => setOpen(i)}
            />
          </Reveal>
        ))}
      </div>

      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} />
    </>
  )
}
