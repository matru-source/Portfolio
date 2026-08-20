import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Layers } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { GalleryImage } from '@/components/gallery'
import { cn } from '@/lib/cn'
import type { Project } from '@/data'

export function ProjectCard({ project }: { project: Project }) {
  const images = useMemo(() => {
    const list: string[] = []
    if (project.image) list.push(project.image)
    if (Array.isArray(project.images)) {
      project.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img)
      })
    }
    return list
  }, [project.image, project.images])

  const [activeIdx, setActiveIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const hasMultiple = images.length > 1

  useEffect(() => {
    if (!hasMultiple || hovered) return
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [hasMultiple, hovered, images.length])

  const currentSrc = images[activeIdx] || project.image

  return (
    <Card hover className="flex h-full flex-col overflow-hidden p-6 sm:p-8">
      {/* Screenshot / Slideshow */}
      {images.length > 0 && (
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl border border-line bg-canvas"
        >
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Visit ${project.name}`}
              className="group/img block h-full w-full"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSrc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 h-full w-full"
                >
                  <GalleryImage
                    src={currentSrc}
                    alt={project.name}
                    label={project.name}
                    className="h-full w-full"
                    imgClassName="transition-transform duration-500 group-hover/img:scale-[1.04]"
                  />
                </motion.div>
              </AnimatePresence>
            </a>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSrc}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 h-full w-full"
              >
                <GalleryImage
                  src={currentSrc}
                  alt={project.name}
                  label={project.name}
                  className="h-full w-full"
                />
              </motion.div>
            </AnimatePresence>
          )}

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
      )}

      <div className="flex items-center justify-between gap-3">
        <Badge tone="primary">{project.domain}</Badge>
        {project.featured && (
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
            Featured
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-bold text-ink">{project.name}</h3>
      <p className="mt-1.5 text-sm text-muted">{project.tagline}</p>
      <p className="mt-4 text-sm leading-relaxed text-body">{project.summary}</p>

      {/* Outcomes */}
      <div className="mt-5 flex flex-wrap gap-2">
        {project.outcomes.map((o) => (
          <span
            key={o}
            className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600"
          >
            {o}
          </span>
        ))}
      </div>

      {/* Highlights */}
      <ul className="mt-5 space-y-2.5">
        {project.highlights.map((h) => (
          <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-body">
            <Check size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {/* KPIs */}
      {project.kpis && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Key metrics</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.kpis.map((k) => (
              <span
                key={k}
                className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-body"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: tools + optional live link */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div className="flex flex-wrap gap-2">
          {project.tools.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Visit project <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </Card>
  )
}
