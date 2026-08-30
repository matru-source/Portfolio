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
    { value: `0${projects.length}`, label: 'Analytics projects' },
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
      <div ref={heroTrackRef} className="relative min-h-[200vh] sm:min-h-[220vh] lg:min-h-[250vh]">
        {/* Sticky Full-Viewport Hero Stage */}
        <div className="sticky top-20 flex min-h-[calc(100vh-5rem)] w-full items-center overflow-hidden">
          {/* Layer 0: Full-Screen 300-Frame Scroll-Driven Canvas */}
          <ScrollPortrait scrollProgress={scrollProgress} />

          {/* Layer 1: Foreground Editorial Content Overlay */}
          <section className="container relative z-10 flex min-h-[calc(100vh-5rem)] w-full flex-col justify-between py-8">
            {/* Top meta */}
            <div className="flex items-start justify-between gap-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="eyebrow max-w-[18rem] leading-relaxed"
              >
                {site.title} — based in {profile.location}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="eyebrow text-right leading-relaxed"
              >
                Portfolio
                <br />© {new Date().getFullYear()}
              </motion.p>
            </div>

            {/* Giant name headline */}
            <div className="my-auto py-6">
              <h1 className="display-hero text-[clamp(2.75rem,9.5vw,7.5rem)] text-ink">
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

            {/* Bottom meta information grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4"
            >
              {experience[0] && (
                <div>
                  <p className="eyebrow">Latest</p>
                  <p className="mt-1.5 text-ink font-medium">
                    {experience[0].role} · {experience[0].org}
                  </p>
                </div>
              )}
              <div>
                <p className="eyebrow">Education</p>
                <p className="mt-1.5 text-ink font-medium">CGPA {profile.cgpa} · B.Tech CSE</p>
              </div>
              <div>
                <p className="eyebrow">Open to</p>
                <p className="mt-1.5 flex items-center gap-2 text-ink font-medium">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-success" /> {site.available}
                </p>
              </div>
              <div className="flex items-end sm:justify-end">
                <Link
                  to="/projects"
                  className="link-underline flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-ink"
                >
                  View work <ArrowDownRight size={14} />
                </Link>
              </div>
            </motion.div>
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
