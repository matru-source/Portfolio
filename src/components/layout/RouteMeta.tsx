import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from '@/content'

const PAGE: Record<string, string> = {
  '/': '',
  '/about': 'About',
  '/projects': 'Projects',
  '/experience': 'Experience',
  '/certifications': 'Certifications',
  '/gallery': 'Gallery',
  '/contact': 'Contact',
}

/** Sets the browser tab title (and description) per route. */
export function RouteMeta() {
  const { pathname } = useLocation()
  const { profile, site } = useContent()

  useEffect(() => {
    const page = PAGE[pathname]
    const base = `${profile.name} — ${site.title}`
    document.title = page ? `${page} · ${base}` : base

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', site.intro)
  }, [pathname, profile.name, site.title, site.intro])

  return null
}
