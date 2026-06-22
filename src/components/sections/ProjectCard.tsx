import { ArrowUpRight, Check } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { GalleryImage } from '@/components/gallery'
import type { Project } from '@/data'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card hover className="flex h-full flex-col overflow-hidden p-6 sm:p-8">
      {/* Optional screenshot (links to the live project if set) */}
      {project.image &&
        (project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Visit ${project.name}`}
            className="group/img mb-6 block aspect-[16/9] overflow-hidden rounded-xl border border-line"
          >
            <GalleryImage
              src={project.image}
              alt={project.name}
              label={project.name}
              className="h-full w-full"
              imgClassName="transition-transform duration-500 group-hover/img:scale-[1.04]"
            />
          </a>
        ) : (
          <div className="mb-6 aspect-[16/9] overflow-hidden rounded-xl border border-line">
            <GalleryImage src={project.image} alt={project.name} label={project.name} className="h-full w-full" />
          </div>
        ))}

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
