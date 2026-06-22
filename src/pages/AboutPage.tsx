import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, GraduationCap, Mail, MapPin, Sparkles } from 'lucide-react'
import { Section, SectionHeading, Reveal, Card, SkillBar, Badge } from '@/components/ui'
import { useContent } from '@/content'

export function AboutPage() {
  const { profile, skills, certifications, achievements, leadership } = useContent()
  return (
    <>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <SectionHeading as="h1" eyebrow="About me" title="Data, dashboards & decisions" />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-body">
              <p>{profile.summary}</p>
              <p>
                I’ve delivered a full-scale FMCG analytics system optimizing primary sales, secondary
                distribution, inventory and salesman performance across multi-level hierarchies — and
                I’ve built dashboards in Power BI, Zoho Analytics and Tableau backed by SQL and Python.
                I also bring a cybersecurity mindset from my IIT Jammu internship and a published
                research paper to the table.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-ink">Quick facts</h3>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <GraduationCap size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-body">
                    {profile.degree}, {profile.college} · CGPA {profile.cgpa}
                  </span>
                </li>
                <li className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-body">{profile.location}</span>
                </li>
                <li className="flex gap-3">
                  <Sparkles size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-body">Focus: Data Analytics & Business Intelligence</span>
                </li>
                <li className="flex gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-primary" />
                  <a href={`mailto:${profile.email}`} className="text-body hover:text-primary">
                    {profile.email}
                  </a>
                </li>
              </ul>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Skills */}
      <Section alt>
        <SectionHeading
          eyebrow="Toolkit"
          title="Skills & technologies"
          subtitle="Proficiency is self-assessed and grounded in real project and internship work."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((cat, i) => (
            <Reveal key={cat.key} delay={i * 0.06}>
              <Card className="h-full p-6">
                <h3 className="font-display text-base font-bold text-ink">{cat.label}</h3>
                <div className="mt-5 space-y-4">
                  {cat.items.map((s) => (
                    <SkillBar key={s.name} name={s.name} level={s.level} accent={cat.accent} />
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Certifications */}
      <Section>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="Credentials" title="Certifications" />
          <Link
            to="/certifications"
            className="link-underline hidden shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-ink sm:flex"
          >
            View &amp; verify all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c, i) => (
            <Reveal key={c.key} delay={i * 0.04}>
              <Card className="flex items-start gap-3 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
                  <Award size={18} />
                </span>
                <div>
                  <p className="font-medium text-ink">{c.title}</p>
                  <p className="text-sm text-muted">
                    {c.issuer}
                    {c.year ? ` · ${c.year}` : ''}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Achievements & Leadership */}
      <Section alt>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Recognition" title="Achievements" />
            <Link
              to="/gallery"
              className="link-underline mt-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-ink"
            >
              Open the gallery <ArrowUpRight size={14} />
            </Link>
            <div className="mt-8 space-y-4">
              {achievements.map((a) => (
                <Reveal key={a.key}>
                  <Card className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-medium text-ink">{a.title}</p>
                      <p className="text-sm text-muted">{a.detail}</p>
                    </div>
                    {a.year && <Badge tone="primary">{a.year}</Badge>}
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Beyond the data" title="Leadership & roles" />
            <div className="mt-8 space-y-4">
              {leadership.map((l) => (
                <Reveal key={l.key}>
                  <Card className="p-5">
                    <p className="font-medium text-ink">{l.title}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {l.org}
                    </p>
                    <p className="mt-1.5 text-sm text-body">{l.detail}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
