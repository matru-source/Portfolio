// Certifications data.
// `image` = path under /public to the certificate scan (jpg/png). `file` = optional PDF.
// Drop the real files into /public/certificates and they appear automatically; until then a
// clean placeholder is shown. See public/ASSETS_README.md for the expected filenames.

export interface Certification {
  key: string
  title: string
  issuer: string
  year?: string
  category: 'Data & Analytics' | 'Cybersecurity' | 'Development' | 'NCC'
  /** Certificate image under /public. */
  image?: string
  /** Additional certificate images / marksheets (slideshow / lightbox). */
  images?: string[]
  /** Optional PDF version. */
  file?: string
  /** Optional online verification URL. */
  url?: string
}

export const certifications: Certification[] = [
  {
    key: 'cisco-da',
    title: 'Data Analytics',
    issuer: 'Cisco',
    category: 'Data & Analytics',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787222697650-Screenshot_2026-08-20_161315.png',
  },
  {
    key: 'cttc-da',
    title: 'Data Analytics',
    issuer: 'CTTC',
    category: 'Data & Analytics',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787177968238-1000381239.jpg',
  },
  {
    key: 'iit-eh',
    title: 'Ethical Hacking',
    issuer: 'IIT Jammu',
    year: '2025',
    category: 'Cybersecurity',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787178237732-1000381241.jpg',
  },
  {
    key: 'udemy-ml',
    title: 'Machine Learning with Python',
    issuer: 'Udemy',
    category: 'Data & Analytics',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787178265648-1000381242.jpg',
  },
  {
    key: 'udemy-java',
    title: 'Advanced Java',
    issuer: 'Udemy',
    category: 'Development',
    image: '/certificates/udemy-advanced-java.jpg',
  },
  {
    key: 'ncc-a',
    title: 'NCC Certificate — A',
    issuer: 'National Cadet Corps',
    category: 'NCC',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787222259818-1000713073.jpg',
  },
  {
    key: 'ncc-b',
    title: 'NCC Certificate — B',
    issuer: 'National Cadet Corps',
    category: 'NCC',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787222259818-1000713073.jpg',
  },
  {
    key: 'ncc-c',
    title: 'NCC Certificate — C',
    issuer: 'National Cadet Corps',
    category: 'NCC',
    image: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1787222259818-1000713073.jpg',
  },
]
