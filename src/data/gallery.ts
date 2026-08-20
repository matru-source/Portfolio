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
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787173323062-1000520311.jpg',
    images: [
      'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787176797140-1000520285.jpg'
    ],
    tags: ['Internship', 'Award'],
  },
  {
    key: 'startup-expo',
    title: '2nd Prize — Startup Exposure',
    caption: 'Startup Exposure, Bhubaneswar.',
    date: '2024',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787173456503-1000454020.jpg',
    images: [
      'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787175069409-1000207200.jpg'
    ],
    tags: ['Entrepreneurship', 'Award'],
  },
  {
    key: 'best-ncc',
    title: 'Best NCC Cadet',
    caption: 'Recognised as Best NCC Cadet.',
    date: '2024',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787174093026-1000335451.jpg',
    tags: ['NCC', 'Leadership'],
  },
  {
    key: 'research',
    title: 'Research Publication',
    caption: 'AI + Astrology integration paper, ICEVB 2025.',
    date: '2025',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787174240130-1000012249.jpg',
    tags: ['Research', 'AI'],
  },
  {
    key: 'mr-fresher',
    title: 'Mr. Fresher — PMEC',
    caption: 'Mr. Fresher, Parala Maharaja Engineering College.',
    date: '2022',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787174444172-1000011457.jpg',
    tags: ['Campus'],
  },
  {
    key: 'youth-parliament',
    title: 'Youth Parliament',
    caption: 'Participant, Youth Parliament.',
    date: '2022',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787174707655-1000520303.jpg',
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
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787174920346-1000655264.jpg',
    images: [
      'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787176832390-1000655264.jpg'
    ],
    tags: ['Conference', 'Research'],
  },
  {
    key: 'startup-expo-event',
    title: 'Startup Exposure, Bhubaneswar',
    caption: 'Pitched and placed 2nd at the startup exposure event.',
    date: '2024',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787175069409-1000207200.jpg',
    tags: ['Startup'],
  },
  {
    key: 'ncc-camp',
    title: 'NCC Camps & Parades',
    caption: 'Training camps and parades as Senior Under Officer.',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787175337285-1000225508.jpg',
    images: [
      'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787176719288-1000225508.jpg',
      'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/gallery/1787178412406-1000381258.jpg'
    ],
    tags: ['NCC'],
  },
  {
    key: 'youth-parliament-event',
    title: 'Youth Parliament',
    caption: 'Debate and parliamentary procedure event.',
    date: '2022',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787175877355-1000712789.jpg',
    images: [
      'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787176649690-1000712789.jpg'
    ],
    tags: ['Public Speaking'],
  },
  {
    key: 'club-events',
    title: 'Club Coordination',
    caption: 'Coordinated Startup, Yoga and Dramatic society events at PMEC.',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787176633772-1000712791.jpg',
    tags: ['Coordinator', 'Campus'],
  },
  {
    key: 'workshops',
    title: 'Analytics Workshops',
    caption: 'Hands-on Data Analytics & BI training sessions.',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787176956611-1000012267.jpg',
    tags: ['Workshop'],
  },
]
