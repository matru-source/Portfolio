import { useEffect, useState } from 'react'
import { FileText, ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface GalleryImageProps {
  src?: string
  alt: string
  /** Short label shown on the placeholder when no image is available. */
  label?: string
  className?: string
  imgClassName?: string
}

function isPdf(url?: string): boolean {
  if (!url) return false
  const clean = url.split('?')[0].toLowerCase()
  return clean.endsWith('.pdf')
}

/**
 * Renders an image, or a styled PDF document preview, or a clean branded placeholder
 * when the source is missing or fails to load.
 */
export function GalleryImage({ src, alt, label, className, imgClassName }: GalleryImageProps) {
  const [failed, setFailed] = useState(false)

  // Reset when the source changes (e.g. lightbox navigation).
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-50 to-canvas p-4 text-center',
          className,
        )}
      >
        <ImageOff size={22} className="text-primary/50" />
        {label && (
          <span className="max-w-[80%] font-mono text-[10px] uppercase tracking-wider text-muted">
            {label}
          </span>
        )}
      </div>
    )
  }

  if (isPdf(src)) {
    const fileName = decodeURIComponent(src.split('/').pop()?.replace(/\.pdf$/i, '') || 'Document')
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-rose-50/80 via-canvas to-primary-50/40 p-5 text-center',
          className,
        )}
      >
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose-500/10 text-rose-600 shadow-sm">
          <FileText size={26} />
        </div>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700">
          PDF Document
        </span>
        <p className="line-clamp-2 max-w-[90%] font-display text-xs font-semibold text-ink">
          {alt || fileName}
        </p>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', imgClassName)}
    />
  )
}
