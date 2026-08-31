import { Suspense, lazy, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Section, SectionHeading, Reveal, Stat } from '@/components/ui'
import { ScrollPortrait } from '@/components/hero/ScrollPortrait'
import { useContent } from '@/content'

const HeroScene = lazy(() => import('@/three/HeroScene').then((m) => ({ default: m.HeroScene })))

export function HomePage() {
  const { profile, site, projects, certifications, experience } = useContent()
  const nameWords = profile.name.split(' ')
  const featured = projects.filter((p) => p.featured)
  const stats = [
    { value: profile.cgpa, label: 'CGPA · B.Tech CSE' },
    { value: `0${projects.length}`, label: 'Projects' },
    { value: `0${experience.length}`, label: 'Internships & roles' },
    { value: `0${certifications.length}`.slice(-2), label: 'Certifications' },
  ]

  const [scrollProgress, setScrollProgress] = useState(0)
  const heroTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const el = heroTrackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        setScrollProgress(0)
        return
      }
      const current = -rect.top
      const progress = Math.max(0, Math.min(1, current / scrollable))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Hero Full-Screen Scroll Track */}
      <div ref={heroTrackRef} className="relative min-h-[220vh] sm:min-h-[240vh] lg:min-h-[280vh]">
        {/* Sticky Full-Viewport Hero Stage */}
        <div className="sticky top-20 flex min-h-[calc(100vh-5rem)] w-full items-center overflow-hidden">
          
          {/* Layer 0: Full-Screen 300-Frame Scroll-Driven Canvas */}
          <ScrollPortrait scrollProgress={scrollProgress} className="absolute inset-0 h-full w-full z-0" />

          {/* Layer 1: Foreground Editorial Content Overlay (Responsive 3-Act Choreography) */}
          <section className="container relative z-10 flex min-h-[calc(100vh-5rem)] w-full items-center py-4 lg:py-6 pointer-events-none">
            
            {/* ACT 1: Bottom-Anchored on Mobile (100% Face Clearance), Right Column on Desktop (0% -> ~22%) */}
            <div
              className="absolute inset-x-4 bottom-8 sm:bottom-12 lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-16 flex w-auto lg:w-full lg:max-w-[540px] flex-col justify-end lg:justify-center gap-3 sm:gap-4 lg:gap-8 pointer-events-auto transition-opacity duration-200 ease-out p-4 rounded-2xl lg:p-0 bg-gradient-to-t from-surface via-surface/95 to-transparent lg:bg-none backdrop-blur-[2px] lg:backdrop-blur-none border border-line/30 lg:border-none"
              style={{
                // Fades out immediately as scroll begins (100% gone by 0.22 scroll before person reaches center)
                opacity: Math.max(0, Math.min(1, (0.22 - scrollProgress) / 0.12)),
                pointerEvents: scrollProgress < 0.20 ? 'auto' : 'none',
              }}
            >
              {/* Top Meta Bar */}
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <p className="eyebrow text-[10px] sm:text-xs lg:text-sm max-w-[12rem] sm:max-w-[17rem] leading-relaxed">
                  Full Stack Developer | Data Analyst — based in {profile.location}
                </p>
                <p className="eyebrow text-[10px] sm:text-xs lg:text-sm text-right leading-relaxed font-mono uppercase tracking-wider">
                  Building Apps &
                  <br />Uncovering Insights
                </p>
              </div>

              {/* Big Impactful Headline */}
              <h1 className="display-hero text-[clamp(2.5rem,7.5vw,6.5rem)] text-ink leading-[0.90] tracking-tight">
                {nameWords.map((word, i) => (
                  <span key={word} className="block overflow-hidden">
                    <motion.span
                      className="block"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.85, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {word}
                      {i === nameWords.length - 1 && <span className="text-primary">.</span>}
                    </motion.span>
                  </span>
                ))}
              </h1>
            </div>

            {/* ACT 2: PHILOSOPHY QUOTE — Bottom Sheet on Mobile, Dual Flanks on Desktop (18% -> 62%) */}
            {(() => {
              const leftQuoteOpacity = scrollProgress >= 0.18 && scrollProgress <= 0.62
                ? Math.min(
                    Math.max(0, (scrollProgress - 0.18) / 0.08),
                    Math.max(0, (0.62 - scrollProgress) / 0.08)
                  )
                : 0

              const rightQuoteOpacity = scrollProgress >= 0.18 && scrollProgress <= 0.54
                ? Math.min(
                    Math.max(0, (scrollProgress - 0.18) / 0.08),
                    Math.max(0, (0.54 - scrollProgress) / 0.08)
                  )
                : 0

              return (
                <>
                  {/* Left Quote: Bottom card on mobile, Left-flank on desktop */}
                  <div
                    className="absolute inset-x-4 bottom-8 sm:bottom-12 lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-12 flex w-auto lg:w-full lg:max-w-[330px] flex-col gap-2.5 sm:gap-3.5 pointer-events-auto transition-opacity duration-150 ease-out p-3.5 sm:p-4 rounded-xl lg:p-0 bg-surface/90 lg:bg-transparent backdrop-blur-sm border border-line/50 lg:border-none shadow-sm lg:shadow-none"
                    style={{
                      opacity: leftQuoteOpacity,
                      pointerEvents: leftQuoteOpacity > 0.1 ? 'auto' : 'none',
                    }}
                  >
                    <p className="eyebrow text-[10px] sm:text-xs uppercase tracking-[0.2em] font-mono text-primary font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 01 // INSIGHT
                    </p>
                    <p className="font-display text-base sm:text-xl lg:text-[1.85rem] text-ink font-medium leading-[1.22] tracking-tight">
                      “Turning raw intelligence into seamless user experiences.”
                    </p>
                  </div>

                  {/* Right Quote: Visible exclusively on Desktop (lg+) to avoid mobile collisions */}
                  <div
                    className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 w-full max-w-[320px] flex-col gap-3.5 pointer-events-auto transition-opacity duration-150 ease-out text-right"
                    style={{
                      opacity: rightQuoteOpacity,
                      pointerEvents: rightQuoteOpacity > 0.1 ? 'auto' : 'none',
                    }}
                  >
                    <p className="eyebrow text-xs uppercase tracking-[0.2em] font-mono text-primary font-semibold flex items-center justify-end gap-2">
                      02 // CRAFTSMANSHIP <span className="h-2 w-2 rounded-full bg-primary" />
                    </p>
                    <p className="font-display text-[1.85rem] text-ink font-medium leading-[1.25] tracking-tight">
                      “Engineering scalable systems with analytical precision.”
                    </p>
                  </div>
                </>
              )
            })()}

            {/* ACT 3: Final Credentials & CTA — Bottom Sheet on Mobile, Left Column on Desktop (68% -> 100%) */}
            <div
              className="absolute inset-x-4 bottom-4 sm:bottom-6 lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-16 flex w-auto lg:w-full lg:max-w-[520px] flex-col justify-end lg:justify-center gap-3 sm:gap-4 lg:gap-7 pointer-events-auto transition-opacity duration-200 ease-out p-4 sm:p-5 rounded-2xl lg:p-0 bg-gradient-to-t from-surface via-surface/95 to-surface/40 lg:bg-none backdrop-blur-[2px] lg:backdrop-blur-none border border-line/40 lg:border-none shadow-sm lg:shadow-none"
              style={{
                // Only fades in once person has cleared to the right (starts at 0.68, full at 0.85)
                opacity: Math.max(0, Math.min(1, (scrollProgress - 0.68) / 0.17)),
                pointerEvents: scrollProgress > 0.70 ? 'auto' : 'none',
              }}
            >
              {/* Big Headline */}
              <h1 className="display-hero text-[clamp(2.25rem,6vw,6rem)] text-ink leading-[0.90] tracking-tight">
                {nameWords.map((word, i) => (
                  <span key={word} className="block">
                    {word}
                    {i === nameWords.length - 1 && <span className="text-primary">.</span>}
                  </span>
                ))}
              </h1>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:gap-x-6 sm:gap-y-5 pt-1 lg:pt-2">
                <div>
                  <p className="eyebrow text-[9px] sm:text-xs uppercase tracking-[0.2em] font-mono font-semibold text-muted">Latest</p>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-base lg:text-lg font-semibold text-ink leading-snug">
                    {experience[0] ? `${experience[0].role} · ${experience[0].org}` : 'Data Analyst · Nexus Infotech'}
                  </p>
                </div>

                <div>
                  <p className="eyebrow text-[9px] sm:text-xs uppercase tracking-[0.2em] font-mono font-semibold text-muted">Education</p>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-base lg:text-lg font-semibold text-ink leading-snug">
                    CGPA {profile.cgpa} · B.Tech CSE
                  </p>
                </div>

                <div>
                  <p className="eyebrow text-[9px] sm:text-xs uppercase tracking-[0.2em] font-mono font-semibold text-muted">Open to</p>
                  <p className="mt-0.5 sm:mt-1 flex items-center gap-1.5 text-xs sm:text-sm lg:text-base font-semibold text-ink leading-snug">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-success animate-pulse" />
                    Open to roles
                  </p>
                </div>

                <div className="flex items-end">
                  <Link
                    to="/projects"
                    className="link-underline flex items-center gap-1.5 font-mono text-xs sm:text-sm lg:text-base uppercase tracking-[0.16em] text-ink font-bold hover:text-primary transition-colors"
                  >
                    View work <ArrowDownRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="overflow-hidden border-y border-line bg-canvas py-4">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
          {[...site.marquee, ...site.marquee].map((t, i) => (
            <span key={i} className="flex items-center gap-8 font-display text-lg text-muted">
              {t}
              <span className="text-primary">✳</span>
            </span>
          ))}
        </div>
      </div>

      {/* Selected work — editorial index with hover reveal */}
      <Section>
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Selected work" title="Projects" />
          <Link
            to="/projects"
            className="link-underline hidden items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-ink sm:flex"
          >
            All projects <ArrowUpRight size={14} />
          </Link>
        </div>

        <ul className="mt-12 border-t border-line">
          {featured.map((p, i) => (
            <li key={p.key} className="border-b border-line">
              <Link
                to="/projects"
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-7 sm:gap-8 sm:py-9"
              >
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-2xl font-medium text-ink transition-colors group-hover:text-primary sm:text-4xl">
                    {p.name}
                  </span>
                  <span className="mt-1 block font-mono text-xs uppercase tracking-wider text-muted">
                    {p.domain} — {p.tools.slice(0, 3).join(' · ')}
                  </span>
                </span>
                <ArrowUpRight
                  size={26}
                  className="shrink-0 text-muted transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Interactive 3D strip */}
      <Section alt className="overflow-hidden">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Interactive"
              title="Data, in three dimensions"
              subtitle="A live, rippling data field — drag to orbit. A small nod to the data-viz work behind the dashboards."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-[320px] sm:h-[420px]">
              <Suspense
                fallback={<div className="h-full w-full rounded-2xl bg-canvas" />}
              >
                <HeroScene />
              </Suspense>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Stats */}
      <Section>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} className="bg-surface p-6 sm:p-8" />
          ))}
        </div>
      </Section>
    </>
  )
}
