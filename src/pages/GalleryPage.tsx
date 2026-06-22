import { Section, SectionHeading } from '@/components/ui'
import { Gallery } from '@/components/gallery'
import { useContent } from '@/content'

export function GalleryPage() {
  const { achievementsGallery, events } = useContent()
  return (
    <>
      <Section>
        <SectionHeading
          as="h1"
          eyebrow="Gallery"
          title="Achievements & events"
          subtitle="A visual record of awards and recognitions, and the events, conferences, camps and functions I've been part of."
        />

        <div id="achievements" className="mt-14 scroll-mt-28">
          <h3 className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Achievements
            <span className="ml-3 text-muted">/ awards &amp; recognition</span>
          </h3>
          <Gallery items={achievementsGallery} columns={3} aspect="photo" />
        </div>
      </Section>

      <Section alt>
        <div id="events" className="scroll-mt-28">
          <SectionHeading eyebrow="Out there" title="Events & functions" />
          <div className="mt-10">
            <Gallery items={events} columns={3} aspect="photo" />
          </div>
        </div>
      </Section>
    </>
  )
}
