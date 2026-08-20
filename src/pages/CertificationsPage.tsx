import { Section, SectionHeading } from '@/components/ui'
import { Gallery, type GalleryEntry } from '@/components/gallery'
import { useContent } from '@/content'
import type { Certification } from '@/data'

const CATEGORY_ORDER: Certification['category'][] = [
  'Data & Analytics',
  'Cybersecurity',
  'Development',
  'NCC',
]

function toEntries(list: Certification[]): GalleryEntry[] {
  return list.map((c) => ({
    image: c.image,
    images: c.images,
    file: c.file,
    title: c.title,
    subtitle: c.year ? `${c.issuer} · ${c.year}` : c.issuer,
  }))
}

export function CertificationsPage() {
  const { certifications } = useContent()
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: certifications.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <Section>
      <SectionHeading
        as="h1"
        eyebrow="Credentials"
        title="Certifications"
        subtitle="Click any certificate to view it full-size. A verified record of every credential — from data analytics and machine learning to cybersecurity and NCC."
      />

      <div className="mt-14 space-y-16">
        {groups.map((g) => (
          <div key={g.cat}>
            <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-primary">
              {g.cat}
              <span className="ml-3 text-muted">/ {String(g.items.length).padStart(2, '0')}</span>
            </h3>
            <Gallery items={toEntries(g.items)} columns={3} aspect="photo" />
          </div>
        ))}
      </div>
    </Section>
  )
}
