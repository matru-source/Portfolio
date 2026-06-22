import type { NavItem, SocialLink } from '@/types'
import { profile } from './profile'

export const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
]

export const socials: SocialLink[] = [
  { label: 'GitHub', href: profile.github, icon: 'Github' },
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'Mail' },
  // LinkedIn is appended at runtime only if a URL is set (see helper below).
]

/** Socials including LinkedIn when its URL is present. */
export function getSocials(): SocialLink[] {
  return buildSocials(profile)
}

/** Build socials from any profile-like object (used with live/admin content). */
export function buildSocials(p: { github: string; email: string; linkedin?: string }): SocialLink[] {
  const list: SocialLink[] = [
    { label: 'GitHub', href: p.github, icon: 'Github' },
    { label: 'Email', href: `mailto:${p.email}`, icon: 'Mail' },
  ]
  if (p.linkedin) list.splice(1, 0, { label: 'LinkedIn', href: p.linkedin, icon: 'Linkedin' })
  return list
}
