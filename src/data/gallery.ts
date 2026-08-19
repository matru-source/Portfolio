// Gallery data — achievements & events photo galleries.
// `image` = path under /public. Drop real photos into the folders below; until then a clean
// placeholder is shown. See public/ASSETS_README.md for the expected filenames.

export interface GalleryItem {
  key: string
  title: string
  caption?: string
  date?: string
  image?: string
  images?: string[]
  tags?: string[]
}

/** Awards & recognitions — the "trophy" gallery. */
export const achievementsGallery: GalleryItem[] = [
  {
    key: 'best-internship',
    title: 'Best Internship Award',
    caption: 'Recognised for outstanding internship project performance at the college felicitation ceremony.',
    date: '2025',
    image: '/gallery/achievements/best-internship-award.jpg',
    tags: ['Internship', 'Award'],
  },
  {
    key: 'startup-expo',
    title: '2nd Prize — Startup Exposure',
    caption: 'Startup Exposure, Bhubaneswar.',
    date: '2024',
    image: '/gallery/achievements/startup-exposure-2024.jpg',
    tags: ['Entrepreneurship', 'Award'],
  },
  {
    key: 'best-ncc',
    title: 'Best NCC Cadet',
    caption: 'Recognised as Best NCC Cadet.',
    date: '2024',
    image: '/gallery/achievements/best-ncc-cadet-2024.jpg',
    tags: ['NCC', 'Leadership'],
  },
  {
    key: 'research',
    title: 'Research Publication',
    caption: 'AI + Astrology integration paper, ICEVB 2025.',
    date: '2025',
    image: '/gallery/achievements/research-icevb-2025.jpg',
    tags: ['Research', 'AI'],
  },
  {
    key: 'mr-fresher',
    title: 'Mr. Fresher — PMEC',
    caption: 'Mr. Fresher, Parala Maharaja Engineering College.',
    date: '2022',
    image: '/gallery/achievements/mr-fresher-2022.jpg',
    tags: ['Campus'],
  },
  {
    key: 'youth-parliament',
    title: 'Youth Parliament',
    caption: 'Participant, Youth Parliament.',
    date: '2022',
    image: '/gallery/achievements/youth-parliament-2022.jpg',
    tags: ['Public Speaking'],
  },
]

/** Events, conferences, camps & functions attended. */
export const events: GalleryItem[] = [
  {
    key: 'icevb',
    title: 'ICEVB 2025 Conference',
    caption: 'Presented & published research on AI + Astrology integration.',
    date: '2025',
    image: '/gallery/events/icevb-2025.jpg',
    tags: ['Conference', 'Research'],
  },
  {
    key: 'startup-expo-event',
    title: 'Startup Exposure, Bhubaneswar',
    caption: 'Pitched and placed 2nd at the startup exposure event.',
    date: '2024',
    image: '/gallery/events/startup-exposure-bhubaneswar.jpg',
    tags: ['Startup'],
  },
  {
    key: 'ncc-camp',
    title: 'NCC Camps & Parades',
    caption: 'Training camps and parades as Senior Under Officer.',
    image: '/gallery/events/ncc-camp.jpg',
    tags: ['NCC'],
  },
  {
    key: 'youth-parliament-event',
    title: 'Youth Parliament',
    caption: 'Debate and parliamentary procedure event.',
    date: '2022',
    image: '/gallery/events/youth-parliament.jpg',
    tags: ['Public Speaking'],
  },
  {
    key: 'club-events',
    title: 'Club Coordination',
    caption: 'Coordinated Startup, Yoga and Dramatic society events at PMEC.',
    image: '/gallery/events/club-events.jpg',
    tags: ['Coordinator', 'Campus'],
  },
  {
    key: 'workshops',
    title: 'Analytics Workshops',
    caption: 'Hands-on Data Analytics & BI training sessions.',
    image: '/gallery/events/workshops.jpg',
    tags: ['Workshop'],
  },
]
