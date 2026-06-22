// MATRU OS — achievements / awards data (Achievement Vault).

export interface Achievement {
  key: string
  title: string
  detail: string
  year?: string
  tier: 'gold' | 'silver' | 'honor'
}

export const achievements: Achievement[] = [
  {
    key: 'best-internship',
    title: 'Best Internship Award',
    detail: 'Recognised for outstanding internship project performance at the college felicitation ceremony.',
    year: '2025',
    tier: 'gold',
  },
  {
    key: 'startup-expo',
    title: '2nd Prize — Startup Exposure',
    detail: 'Startup Exposure, Bhubaneswar.',
    year: '2024',
    tier: 'silver',
  },
  {
    key: 'best-ncc',
    title: 'Best NCC Cadet',
    detail: 'Recognised as Best NCC Cadet.',
    year: '2024',
    tier: 'gold',
  },
  {
    key: 'research',
    title: 'Research Publication',
    detail: 'AI + Astrology integration paper, ICEVB 2025.',
    year: '2025',
    tier: 'gold',
  },
  {
    key: 'mr-fresher',
    title: 'Mr. Fresher — PMEC',
    detail: 'Mr. Fresher, Parala Maharaja Engineering College.',
    year: '2022',
    tier: 'honor',
  },
  {
    key: 'youth-parliament',
    title: 'Youth Parliament',
    detail: 'Participant, Youth Parliament.',
    year: '2022',
    tier: 'honor',
  },
]
