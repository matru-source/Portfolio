import type { SiteContent } from '@/content'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'toggle'
  | 'select'
  | 'stringList'
  | 'image'
  | 'file'
  | 'sublist'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: readonly string[]
  placeholder?: string
  full?: boolean
  // for sublist
  subFields?: FieldDef[]
  newItem?: () => Record<string, unknown>
}

export interface SectionDef {
  key: keyof SiteContent
  label: string
  kind: 'object' | 'list'
  fields: FieldDef[]
  /** which field to show as the list-item title */
  labelKey?: string
  newItem?: () => Record<string, unknown>
}

const uid = () => `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const profileFields: FieldDef[] = [
  { key: 'name', label: 'Full name', type: 'text' },
  { key: 'positioning', label: 'Positioning', type: 'text' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'summary', label: 'Summary', type: 'textarea', full: true },
  { key: 'roles', label: 'Roles (one per line)', type: 'stringList', full: true },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'github', label: 'GitHub URL', type: 'text' },
  { key: 'githubHandle', label: 'GitHub handle', type: 'text' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'text' },
  { key: 'resumeUrl', label: 'Résumé (PDF — upload or URL)', type: 'file', full: true },
  { key: 'degree', label: 'Degree', type: 'text' },
  { key: 'college', label: 'College', type: 'text' },
  { key: 'cgpa', label: 'CGPA', type: 'text' },
  { key: 'gradWindow', label: 'Graduation window', type: 'text' },
]

const siteFields: FieldDef[] = [
  { key: 'title', label: 'Title (Data Analyst & BI Engineer)', type: 'text' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'available', label: 'Availability line', type: 'text' },
  { key: 'intro', label: 'Intro paragraph', type: 'textarea', full: true },
  { key: 'marquee', label: 'Marquee terms (one per line)', type: 'stringList', full: true },
]

export const SECTIONS: SectionDef[] = [
  { key: 'profile', label: 'Profile & contact', kind: 'object', fields: profileFields },
  { key: 'site', label: 'Home / site text', kind: 'object', fields: siteFields },
  {
    key: 'projects',
    label: 'Projects',
    kind: 'list',
    labelKey: 'name',
    newItem: () => ({
      key: uid(),
      name: 'New project',
      tagline: '',
      domain: 'FMCG',
      tools: [],
      summary: '',
      highlights: [],
      outcomes: [],
      kpis: [],
      featured: false,
      image: '',
      liveUrl: '',
    }),
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'domain', label: 'Domain', type: 'select', options: ['FMCG', 'Food & Retail', 'Aviation'] },
      { key: 'featured', label: 'Featured on home', type: 'toggle' },
      { key: 'image', label: 'Screenshot / dashboard image (optional)', type: 'image', full: true },
      { key: 'liveUrl', label: 'Live link (optional)', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea', full: true },
      { key: 'tools', label: 'Tools (one per line)', type: 'stringList' },
      { key: 'outcomes', label: 'Outcomes (one per line)', type: 'stringList' },
      { key: 'highlights', label: 'Highlights (one per line)', type: 'stringList', full: true },
      { key: 'kpis', label: 'KPIs (one per line)', type: 'stringList' },
      { key: 'key', label: 'ID (slug)', type: 'text' },
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    kind: 'list',
    labelKey: 'label',
    newItem: () => ({ key: uid(), label: 'New category', accent: 'primary', items: [] }),
    fields: [
      { key: 'label', label: 'Category name', type: 'text' },
      { key: 'accent', label: 'Accent', type: 'select', options: ['primary', 'cyan', 'gold', 'success', 'danger'] },
      { key: 'key', label: 'ID', type: 'text' },
      {
        key: 'items',
        label: 'Skills',
        type: 'sublist',
        full: true,
        newItem: () => ({ name: 'New skill', level: 80, note: '' }),
        subFields: [
          { key: 'name', label: 'Skill', type: 'text' },
          { key: 'level', label: 'Level (0–100)', type: 'number' },
          { key: 'note', label: 'Note', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'experience',
    label: 'Experience',
    kind: 'list',
    labelKey: 'org',
    newItem: () => ({
      key: uid(),
      org: 'New organisation',
      role: '',
      location: '',
      period: '',
      domain: 'Analytics',
      highlights: [],
      tools: [],
    }),
    fields: [
      { key: 'org', label: 'Organisation', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'domain', label: 'Domain', type: 'select', options: ['Analytics', 'Cyber', 'Teaching'] },
      { key: 'highlights', label: 'Highlights (one per line)', type: 'stringList', full: true },
      { key: 'tools', label: 'Tools (one per line)', type: 'stringList' },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'certifications',
    label: 'Certifications',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), title: 'New certificate', issuer: '', year: '', category: 'Data & Analytics', image: '' }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'issuer', label: 'Issuer', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['Data & Analytics', 'Cybersecurity', 'Development', 'NCC'] },
      { key: 'image', label: 'Certificate image', type: 'image', full: true },
      { key: 'file', label: 'PDF URL (optional)', type: 'text' },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'achievementsGallery',
    label: 'Achievements (gallery)',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), title: 'New achievement', caption: '', date: '', image: '', tags: [] }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'date', label: 'Date', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'textarea', full: true },
      { key: 'image', label: 'Photo', type: 'image', full: true },
      { key: 'tags', label: 'Tags (one per line)', type: 'stringList' },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'events',
    label: 'Events (gallery)',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), title: 'New event', caption: '', date: '', image: '', tags: [] }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'date', label: 'Date', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'textarea', full: true },
      { key: 'image', label: 'Photo', type: 'image', full: true },
      { key: 'tags', label: 'Tags (one per line)', type: 'stringList' },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'achievements',
    label: 'Achievements (text)',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), title: 'New achievement', detail: '', year: '', tier: 'honor' }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'detail', label: 'Detail', type: 'textarea', full: true },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'tier', label: 'Tier', type: 'select', options: ['gold', 'silver', 'honor'] },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'leadership',
    label: 'Leadership & roles',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), title: 'New role', org: '', detail: '' }),
    fields: [
      { key: 'title', label: 'Role', type: 'text' },
      { key: 'org', label: 'Organisation', type: 'text' },
      { key: 'detail', label: 'Detail', type: 'textarea', full: true },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'research',
    label: 'Research',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), title: 'New paper', venue: '', year: '', theme: '', abstract: '', contributions: [], url: '' }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'theme', label: 'Theme', type: 'text' },
      { key: 'abstract', label: 'Abstract', type: 'textarea', full: true },
      { key: 'contributions', label: 'Contributions (one per line)', type: 'stringList', full: true },
      { key: 'url', label: 'Link / DOI', type: 'text' },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
  {
    key: 'timeline',
    label: 'Journey timeline',
    kind: 'list',
    labelKey: 'title',
    newItem: () => ({ key: uid(), year: '', title: 'New milestone', org: '', place: '', blurb: '', stage: 'engineering', future: false }),
    fields: [
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'org', label: 'Organisation', type: 'text' },
      { key: 'place', label: 'Place', type: 'text' },
      { key: 'stage', label: 'Stage', type: 'select', options: ['roots', 'discipline', 'engineering', 'analytics', 'cyber', 'research', 'leadership', 'future'] },
      { key: 'future', label: 'Future (aspirational)', type: 'toggle' },
      { key: 'blurb', label: 'Blurb', type: 'textarea', full: true },
      { key: 'key', label: 'ID', type: 'text' },
    ],
  },
]
