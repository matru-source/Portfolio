import { Suspense, lazy } from 'react'
import { FileText } from 'lucide-react'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { Section, SectionHeading, Reveal, Card, Badge } from '@/components/ui'
import { useContent } from '@/content'

const ProjectsScene = lazy(() =>
  import('@/three/ProjectsScene').then((m) => ({ default: m.ProjectsScene })),
)

export function ProjectsPage() {
  const { projects, research } = useContent()
  return (
    <>
      {/* Header */}
      <section className="border-b border-line">
        <div className="container grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow="Projects"
              title="Analytics, dashboards & BI"
              subtitle="A selection of data-analytics work across FMCG, food & retail, and aviation — from data modeling and SQL to interactive dashboards and KPIs."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-[240px] sm:h-[300px]">
              <Suspense fallback={<div className="h-full w-full rounded-2xl bg-primary-50" />}>
                <ProjectsScene />
              </Suspense>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Project grid */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.08} className={i === 0 ? 'lg:col-span-2' : ''}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Research */}
      <Section alt>
        <SectionHeading eyebrow="Research" title="Published work" />
        <div className="mt-10 grid gap-6">
          {research.map((r) => (
            <Reveal key={r.key}>
              <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
                    <FileText size={18} />
                  </span>
                  <Badge tone="accent">{r.venue}</Badge>
                  <Badge>{r.theme}</Badge>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-body">{r.abstract}</p>
                <ul className="mt-4 space-y-2">
                  {r.contributions.map((c) => (
                    <li key={c} className="flex gap-2.5 text-sm text-body">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}
