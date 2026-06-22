import { BarChart3, GraduationCap, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Section, SectionHeading, Reveal, Card, Badge } from '@/components/ui'
import { useContent } from '@/content'
import type { Experience } from '@/data'

const domainIcon: Record<Experience['domain'], LucideIcon> = {
  Analytics: BarChart3,
  Cyber: ShieldCheck,
  Teaching: GraduationCap,
}

export function ExperiencePage() {
  const { experience, timeline } = useContent()
  const education = timeline.filter((t) => t.stage === 'roots' || t.stage === 'engineering')

  return (
    <>
      <Section>
        <SectionHeading
          as="h1"
          eyebrow="Experience"
          title="Where I’ve worked"
          subtitle="Internships and roles across data analytics, cybersecurity and teaching."
        />

        <ol className="relative mt-12 space-y-6 before:absolute before:bottom-3 before:left-[19px] before:top-3 before:w-px before:bg-line">
          {experience.map((x, i) => {
            const Icon = domainIcon[x.domain]
            return (
              <li key={x.key} className="relative pl-14">
                <span className="absolute left-0 top-0.5 grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-primary shadow-sm">
                  <Icon size={18} />
                </span>
                <Reveal delay={i * 0.05}>
                  <Card className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">{x.org}</h3>
                        <p className="text-sm font-semibold text-primary">{x.role}</p>
                      </div>
                      <div className="text-right">
                        <Badge tone="primary">{x.period}</Badge>
                        <p className="mt-1 text-xs text-muted">{x.location}</p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {x.highlights.map((h) => (
                        <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-body">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    {x.tools && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {x.tools.map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </Section>

      {/* Education */}
      <Section alt>
        <SectionHeading eyebrow="Education" title="Academic foundation" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {education.map((e) => (
            <Reveal key={e.key}>
              <Card className="p-6">
                <Badge tone="primary">{e.year}</Badge>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{e.title}</h3>
                <p className="text-sm font-medium text-primary">{e.org}</p>
                <p className="mt-1 text-sm text-muted">{e.place}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}
