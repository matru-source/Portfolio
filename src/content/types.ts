import type {
  Project,
  SkillCategory,
  Experience,
  Certification,
  Achievement,
  LeadershipRole,
  ResearchPaper,
  TimelineEvent,
  GalleryItem,
} from '@/data'

export interface ProfileContent {
  name: string
  positioning: string
  tagline: string
  summary: string
  roles: string[]
  email: string
  phone: string
  location: string
  github: string
  githubHandle: string
  linkedin: string
  resumeUrl: string
  degree: string
  college: string
  cgpa: string
  gradWindow: string
}

export interface SiteText {
  title: string
  tagline: string
  available: string
  intro: string
  marquee: string[]
}

/** The entire editable site, stored as one JSON document in Supabase. */
export interface SiteContent {
  profile: ProfileContent
  site: SiteText
  projects: Project[]
  skills: SkillCategory[]
  experience: Experience[]
  certifications: Certification[]
  achievements: Achievement[]
  achievementsGallery: GalleryItem[]
  events: GalleryItem[]
  leadership: LeadershipRole[]
  research: ResearchPaper[]
  timeline: TimelineEvent[]
}
