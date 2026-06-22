// MATRU OS — journey timeline data (Starline).

export interface TimelineEvent {
  key: string
  year: string
  title: string
  org: string
  place: string
  blurb: string
  /** Story-arc stage this beat expresses. */
  stage:
    | 'roots'
    | 'discipline'
    | 'engineering'
    | 'analytics'
    | 'cyber'
    | 'research'
    | 'leadership'
    | 'future'
  /** Aspirational / future node — styled distinctly (gold hologram). */
  future?: boolean
}

export const timeline: TimelineEvent[] = [
  {
    key: 'chse',
    year: '2020',
    title: 'Higher Secondary (CHSE)',
    org: 'Dhenkanal Autonomous College',
    place: 'Dhenkanal, Odisha',
    blurb: 'The roots — foundations laid in Dhenkanal.',
    stage: 'roots',
  },
  {
    key: 'pmec',
    year: '2022',
    title: 'B.Tech in Computer Science & Engineering',
    org: 'Parala Maharaja Engineering College (PMEC)',
    place: 'Berhampur, Odisha',
    blurb: 'Engineering begins — graduated 2026, CGPA 8.0.',
    stage: 'engineering',
  },
  {
    key: 'cttc',
    year: '2023',
    title: 'Data Analyst Intern',
    org: 'Central Tool Training Centre (CTTC)',
    place: 'Bhubaneswar',
    blurb: 'First analytics mission — airline performance dashboards.',
    stage: 'analytics',
  },
  {
    key: 'iit',
    year: '2025',
    title: 'Cybersecurity Intern',
    org: 'IIT Jammu',
    place: 'Jammu',
    blurb: 'Secure monitoring, documentation & threat detection.',
    stage: 'cyber',
  },
  {
    key: 'nexus',
    year: '2025',
    title: 'Data Analyst',
    org: 'Nexus Infotech',
    place: 'Berhampur, Odisha',
    blurb: 'CEO & regional FMCG dashboards over 2 lakh+ records.',
    stage: 'analytics',
  },
  {
    key: 'future',
    year: 'Future',
    title: 'Data Scientist',
    org: 'The next ascent',
    place: '—',
    blurb: 'Building the intelligence layer for what comes next.',
    stage: 'future',
    future: true,
  },
]
