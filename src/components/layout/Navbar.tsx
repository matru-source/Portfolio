import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { navItems } from '@/data'
import { useContent } from '@/content'
import { cn } from '@/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'link-underline font-mono text-xs uppercase tracking-[0.16em] transition-colors',
    isActive ? 'text-ink' : 'text-muted hover:text-ink',
  )

export function Navbar() {
  const { profile } = useContent()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-md">
      <nav className="container flex h-20 items-center justify-between">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-ink"
          aria-label="Home"
        >
          {profile.name}
          <span className="text-primary">.</span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {navItems.map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} end={n.to === '/'} className={linkClass}>
                {n.label}
              </NavLink>
            </li>
          ))}
          {profile.resumeUrl && (
            <li>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.16em] text-ink"
              >
                Résumé <ArrowUpRight size={13} />
              </a>
            </li>
          )}
        </ul>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center text-ink lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-surface lg:hidden"
          >
            <ul className="container flex flex-col py-4">
              {navItems.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block py-3 font-mono text-sm uppercase tracking-widest',
                        isActive ? 'text-ink' : 'text-muted',
                      )
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
              {profile.resumeUrl && (
                <li>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 py-3 font-mono text-sm uppercase tracking-widest text-ink"
                  >
                    Résumé <ArrowUpRight size={15} />
                  </a>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
