import { Download, Mail, MapPin, Phone } from 'lucide-react'
import { ContactForm } from '@/components/sections/ContactForm'
import { Section, SectionHeading, Reveal, Card, buttonStyles } from '@/components/ui'
import { buildSocials } from '@/data'
import { useContent } from '@/content'
import { socialIcon } from '@/components/layout/socialIcons'

export function ContactPage() {
  const { profile } = useContent()
  const socials = buildSocials(profile)

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left — info */}
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="Let’s build something with data"
            subtitle="Open to Data Analytics and Business Intelligence roles. The fastest way to reach me is email — or use the form."
          />

          <ul className="mt-8 space-y-4">
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-4 text-body transition-colors hover:text-primary"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
                  <Mail size={18} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted">Email</span>
                  {profile.email}
                </span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${profile.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 text-body transition-colors hover:text-primary"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
                  <Phone size={18} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted">Phone</span>
                  {profile.phone}
                </span>
              </a>
            </li>
            <li className="flex items-center gap-4 text-body">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
                <MapPin size={18} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-muted">Location</span>
                {profile.location}
              </span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {socials.map((s) => {
              const Icon = socialIcon(s.icon)
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-body transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon size={18} />
                </a>
              )
            })}
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonStyles('outline', 'md')}
              >
                <Download size={16} /> Résumé
              </a>
            )}
          </div>
        </Reveal>

        {/* Right — form */}
        <Reveal delay={0.1}>
          <Card className="p-6 sm:p-8">
            <ContactForm />
          </Card>
        </Reveal>
      </div>
    </Section>
  )
}
