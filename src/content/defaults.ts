import {
  profile,
  projects,
  skillCategories,
  experience,
  certifications,
  achievements,
  achievementsGallery,
  events,
  leadership,
  research,
  timeline,
} from '@/data'
import { SITE } from '@/lib/constants'
import type { SiteContent } from './types'

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

/** The default content — the current static résumé data. Used as the seed and as a
 * resilient fallback whenever Supabase is unconfigured, empty, or unreachable. */
export const defaultContent: SiteContent = {
  profile: {
    name: profile.name,
    positioning: profile.positioning,
    tagline: profile.tagline,
    summary: profile.summary,
    roles: [...profile.roles],
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    github: profile.github,
    githubHandle: profile.githubHandle,
    linkedin: profile.linkedin,
    resumeUrl: profile.resumeUrl,
    photo: profile.photo,
    degree: profile.degree,
    college: profile.college,
    cgpa: profile.cgpa,
    gradWindow: profile.gradWindow,
  },
  site: {
    title: SITE.title,
    tagline: SITE.tagline,
    available: SITE.available,
    intro: SITE.intro,
    marquee: [...SITE.marquee],
  },
  projects: clone(projects),
  skills: clone(skillCategories),
  experience: clone(experience),
  certifications: clone(certifications),
  achievements: clone(achievements),
  achievementsGallery: clone(achievementsGallery),
  events: clone(events),
  leadership: clone(leadership),
  research: clone(research),
  timeline: clone(timeline),
}

/** Deep-clone the defaults (so the editor can mutate a working copy safely). */
export function freshDefault(): SiteContent {
  return clone(defaultContent)
}
