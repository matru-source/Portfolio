// MATRU OS — leadership & roles data (Leadership Hub).

export interface LeadershipRole {
  key: string
  title: string
  org: string
  detail: string
}

export const leadership: LeadershipRole[] = [
  {
    key: 'ncc-suo',
    title: 'Senior Under Officer (SUO)',
    org: 'National Cadet Corps',
    detail: 'Former Senior Under Officer — the highest cadet appointment, leading and disciplining the unit.',
  },
  {
    key: 'startup-coord',
    title: 'Coordinator — Startup Club',
    org: 'PMEC',
    detail: 'Coordinated startup and entrepreneurship initiatives.',
  },
  {
    key: 'yoga-coord',
    title: 'Coordinator — Yoga Club',
    org: 'PMEC',
    detail: 'Led wellness and yoga programming.',
  },
  {
    key: 'drama-coord',
    title: 'Coordinator — Dramatic Society',
    org: 'PMEC',
    detail: 'Coordinated the dramatics and stage society.',
  },
  {
    key: 'lecturer',
    title: 'Contract Lecturer — Retail Management',
    org: 'Dhenkanal Autonomous College',
    detail: 'Taught Retail Management and mentored students (2022–2024).',
  },
]
