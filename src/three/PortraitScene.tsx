import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

interface PortraitSceneProps {
  photo: string
  photos?: string[]
  name?: string
  caption?: string
  className?: string
}

/**
 * Interactive 3D portrait card (CSS 3D — uses a normal <img>, so any photo
 * loads without WebGL/CORS issues). Floats and gently sways; supports multi-photo cycling.
 */
export function PortraitScene({
  photo,
  photos,
  name = 'Matru Panda',
  caption = 'Data Analyst',
  className,
}: PortraitSceneProps) {
  const reduced = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const hovered = useRef(false)
  const rotY = useRef(0)
  const [failed, setFailed] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  const allPhotos = useMemo(() => {
    if (Array.isArray(photos) && photos.length > 0) {
      const list = photos.filter(Boolean)
      if (list.length > 0) return list
    }
    return photo ? [photo] : []
  }, [photo, photos])

  const hasMultiple = allPhotos.length > 1

  // Auto-cycle profile photos every 3s if multiple photos provided
  useEffect(() => {
    if (!hasMultiple) return
    const interval = setInterval(() => {
      if (!hovered.current) {
        setActivePhotoIdx((prev) => (prev + 1) % allPhotos.length)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [hasMultiple, allPhotos.length])

  useEffect(() => setFailed(false), [photo, activePhotoIdx])

  useEffect(() => {
    let raf = 0
    let t = 0
    const loop = () => {
      t += 0.016
      let display: number
      if (hovered.current && !reduced) {
        // Calm settling when hovered (no spinning)
        rotY.current += (0 - rotY.current) * 0.1
        display = rotY.current
      } else {
        const base = 0
        rotY.current += (base - rotY.current) * 0.08
        display = rotY.current + (reduced ? 0 : Math.sin(t * 0.8) * 3) // subtle gentle sway
      }
      const floatY = reduced ? 0 : Math.sin(t * 0.9) * 6
      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${floatY}px) rotateY(${display}deg)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const initials = initialsOf(name)
  const currentPhoto = allPhotos[activePhotoIdx] || photo
  const showPhoto = Boolean(currentPhoto) && !failed

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center [perspective:1200px]',
        className,
      )}
    >
      <div
        ref={cardRef}
        onPointerEnter={() => (hovered.current = true)}
        onPointerLeave={() => (hovered.current = false)}
        className="relative aspect-[3/4] h-[86%] max-h-[520px] will-change-transform [transform-style:preserve-3d]"
      >
        {/* Front — the photo */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-card [backface-visibility:hidden]">
          {showPhoto ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhoto}
                src={currentPhoto}
                alt={name}
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onError={() => setFailed(true)}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-canvas">
              <span className="font-display text-5xl font-bold text-primary/40">{initials}</span>
            </div>
          )}

          {/* Mini multiple photos dots indicator */}
          {hasMultiple && (
            <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-full bg-ink/75 px-2 py-1 backdrop-blur-sm shadow-sm">
              {allPhotos.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === activePhotoIdx ? 'w-3 bg-white' : 'w-1.5 bg-white/40',
                  )}
                />
              ))}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 bg-primary py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-surface">
            {caption}
          </div>
        </div>

        {/* Back — revealed on spin */}
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-primary shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="font-display text-6xl font-bold text-surface/90">{initials}</span>
        </div>
      </div>
    </div>
  )
}
