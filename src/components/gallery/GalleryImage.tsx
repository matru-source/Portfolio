import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface GalleryImageProps {
  src?: string
  alt: string
  /** Short label shown on the placeholder when no image is available. */
  label?: string
  className?: string
  imgClassName?: string
}

/**
 * Renders an image, or a clean branded placeholder when the image is missing or
 * fails to load — so the gallery looks intentional before real photos are added.
 */
export function GalleryImage({ src, alt, label, className, imgClassName }: GalleryImageProps) {
  const [failed, setFailed] = useState(false)

  // Reset when the source changes (e.g. lightbox navigation).
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-50 to-canvas',
          className,
        )}
      >
        <ImageOff size={22} className="text-primary/50" />
        {label && (
          <span className="max-w-[80%] text-center font-mono text-[10px] uppercase tracking-wider text-muted">
            {label}
          </span>
        )}
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
