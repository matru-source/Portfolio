import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
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

/** Responsive thumbnail grid that opens an accessible lightbox. */
export function Gallery({ items, aspect = 'photo', columns = 3 }: GalleryProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <div className={cn('grid grid-cols-1 gap-6', colClass[columns])}>
        {items.map((item, i) => (
          <Reveal key={item.title + i} delay={(i % 3) * 0.06}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View ${item.title}`}
              className="group block w-full text-left"
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl border border-line bg-canvas',
                  aspectClass[aspect],
                )}
              >
                <GalleryImage
                  src={item.image}
                  alt={item.title}
                  label={item.title}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/25 group-hover:opacity-100">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-surface text-ink">
                    <Maximize2 size={18} />
                  </span>
                </div>
                {item.date && (
                  <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 font-mono text-[10px] font-medium text-ink">
                    {item.date}
                  </span>
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
          </Reveal>
        ))}
      </div>

      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} />
    </>
  )
}
