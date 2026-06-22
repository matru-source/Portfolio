import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { navItems, buildSocials } from '@/data'
import { useContent } from '@/content'
import { socialIcon } from './socialIcons'

export function Footer() {
  const { profile, site } = useContent()
  const year = new Date().getFullYear()
  const socials = buildSocials(profile)

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container py-16">
        {/* CTA line */}
        <Link to="/contact" className="group block">
          <p className="eyebrow">Available for work</p>
          <h2 className="mt-3 flex flex-wrap items-center gap-3 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Let’s build with data
            <ArrowUpRight
              size={36}
              className="text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </h2>
        </Link>

        <div className="mt-14 flex flex-col gap-10 border-t border-line pt-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg font-semibold text-ink">
              {profile.name}
              <span className="text-primary">.</span>
            </p>
            <p className="mt-2 text-sm text-muted">{site.title}</p>
            <p className="text-sm text-muted">{profile.location}</p>
          </div>

          <div className="flex gap-16">
            <nav className="flex flex-col gap-2.5">
              <p className="eyebrow mb-1">Menu</p>
              {navItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="link-underline w-fit text-sm text-body hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2.5">
              <p className="eyebrow mb-1">Connect</p>
              {socials.map((s) => {
                const Icon = socialIcon(s.icon)
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline flex w-fit items-center gap-2 text-sm text-body hover:text-ink"
                  >
                    <Icon size={15} /> {s.label}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 text-xs text-muted sm:flex-row sm:justify-between">
          <span>
            © {year} {profile.name}
          </span>
          <span className="font-mono">Built with React · Three.js · Tailwind</span>
        </div>
      </div>
    </footer>
  )
}
