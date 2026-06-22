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
    image: '/certificates/cisco-data-analytics.jpg',
  },
  {
    key: 'cttc-da',
    title: 'Data Analytics',
    issuer: 'CTTC',
    category: 'Data & Analytics',
    image: '/certificates/cttc-data-analytics.jpg',
  },
  {
    key: 'iit-eh',
    title: 'Ethical Hacking',
    issuer: 'IIT Jammu',
    year: '2025',
    category: 'Cybersecurity',
    image: '/certificates/iit-ethical-hacking.jpg',
  },
  {
    key: 'udemy-ml',
    title: 'Machine Learning with Python',
    issuer: 'Udemy',
    category: 'Data & Analytics',
    image: '/certificates/udemy-ml-python.jpg',
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
    image: '/certificates/ncc-a.jpg',
  },
  {
    key: 'ncc-b',
    title: 'NCC Certificate — B',
    issuer: 'National Cadet Corps',
    category: 'NCC',
    image: '/certificates/ncc-b.jpg',
  },
  {
    key: 'ncc-c',
    title: 'NCC Certificate — C',
    issuer: 'National Cadet Corps',
    category: 'NCC',
    image: '/certificates/ncc-c.jpg',
  },
]
