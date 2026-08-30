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

          {/* Layer 1: Foreground Editorial Content Overlay (3-Act Stationary Scroll Choreography) */}
          <section className="container relative z-10 flex min-h-[calc(100vh-5rem)] w-full items-center py-6 pointer-events-none">
            
            {/* ACT 1: RIGHT COLUMN — Visible strictly at Start (0% -> ~22%) when person is on the LEFT */}
            <div
              className="absolute right-6 sm:right-10 lg:right-16 top-1/2 -translate-y-1/2 flex w-full max-w-[460px] lg:max-w-[540px] flex-col justify-center gap-8 py-4 pointer-events-auto transition-opacity duration-200 ease-out"
              style={{
                // Fades out immediately as scroll begins (100% gone by 0.22 scroll before person reaches center)
                opacity: Math.max(0, Math.min(1, (0.22 - scrollProgress) / 0.12)),
                pointerEvents: scrollProgress < 0.20 ? 'auto' : 'none',
              }}
            >
              {/* Top Meta Bar */}
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow text-xs sm:text-sm max-w-[17rem] leading-relaxed">
                  Full Stack Developer | Data Analyst — based in {profile.location}
                </p>
                <p className="eyebrow text-xs sm:text-sm text-right leading-relaxed">
                  Portfolio
                  <br />© {new Date().getFullYear()}
                </p>
              </div>

              {/* Big Impactful Headline */}
              <h1 className="display-hero text-[clamp(3.5rem,7vw,6.5rem)] text-ink leading-[0.90] tracking-tight">
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

            {/* ACT 2: DUAL PHILOSOPHY POINTS — Visible during middle walk (18% -> 54% on right, 18% -> 62% on left) */}
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
                  {/* Left Flank Quote */}
                  <div
                    className="absolute left-6 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 flex w-full max-w-[280px] sm:max-w-[310px] lg:max-w-[330px] flex-col gap-3.5 pointer-events-auto transition-opacity duration-150 ease-out"
                    style={{
                      opacity: leftQuoteOpacity,
                      pointerEvents: leftQuoteOpacity > 0.1 ? 'auto' : 'none',
                    }}
                  >
                    <p className="eyebrow text-xs uppercase tracking-[0.2em] font-mono text-primary font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 01 // INSIGHT
                    </p>
                    <p className="font-display text-xl sm:text-2xl lg:text-[1.85rem] text-ink font-medium leading-[1.25] tracking-tight">
                      “Turning raw intelligence into seamless user experiences.”
                    </p>
                  </div>

                  {/* Right Flank Quote */}
                  <div
                    className="absolute right-6 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 flex w-full max-w-[260px] sm:max-w-[290px] lg:max-w-[320px] flex-col gap-3.5 pointer-events-auto transition-opacity duration-150 ease-out text-right"
                    style={{
                      opacity: rightQuoteOpacity,
                      pointerEvents: rightQuoteOpacity > 0.1 ? 'auto' : 'none',
                    }}
                  >
                    <p className="eyebrow text-xs uppercase tracking-[0.2em] font-mono text-primary font-semibold flex items-center justify-end gap-2">
                      02 // CRAFTSMANSHIP <span className="h-2 w-2 rounded-full bg-primary" />
                    </p>
                    <p className="font-display text-xl sm:text-2xl lg:text-[1.85rem] text-ink font-medium leading-[1.25] tracking-tight">
                      “Engineering scalable systems with analytical precision.”
                    </p>
                  </div>
                </>
              )
            })()}

            {/* ACT 3: LEFT COLUMN — Visible strictly at End (~68% -> 100%) when person has settled on the RIGHT */}
            <div
              className="absolute left-6 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2 flex w-full max-w-[460px] lg:max-w-[520px] flex-col justify-center gap-7 py-4 pointer-events-auto transition-opacity duration-200 ease-out"
              style={{
                // Only fades in once person has cleared to the right (starts at 0.68, full at 0.85)
                opacity: Math.max(0, Math.min(1, (scrollProgress - 0.68) / 0.17)),
                pointerEvents: scrollProgress > 0.70 ? 'auto' : 'none',
              }}
            >
              {/* Big Headline */}
              <h1 className="display-hero text-[clamp(3.25rem,6.5vw,6rem)] text-ink leading-[0.90] tracking-tight">
                {nameWords.map((word, i) => (
                  <span key={word} className="block">
                    {word}
                    {i === nameWords.length - 1 && <span className="text-primary">.</span>}
                  </span>
                ))}
              </h1>

              {/* Information Stack without overflowing horizontal border line */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-2">
                <div>
                  <p className="eyebrow text-xs uppercase tracking-[0.2em] font-mono font-semibold text-muted">Latest</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-ink leading-snug">
                    {experience[0] ? `${experience[0].role} · ${experience[0].org}` : 'Data Analyst · Nexus Infotech'}
                  </p>
                </div>

                <div>
                  <p className="eyebrow text-xs uppercase tracking-[0.2em] font-mono font-semibold text-muted">Education</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-ink leading-snug">
                    CGPA {profile.cgpa} · B.Tech CSE
                  </p>
                </div>

                <div>
                  <p className="eyebrow text-xs uppercase tracking-[0.2em] font-mono font-semibold text-muted">Open to</p>
                  <p className="mt-1 flex items-center gap-2 text-sm sm:text-base font-semibold text-ink leading-snug">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-success animate-pulse" />
                    Open to opportunities
                  </p>
                </div>

                <div className="flex items-end">
                  <Link
                    to="/projects"
                    className="link-underline flex items-center gap-2 font-mono text-sm sm:text-base uppercase tracking-[0.16em] text-ink font-bold hover:text-primary transition-colors"
                  >
                    View work <ArrowDownRight size={18} />
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
