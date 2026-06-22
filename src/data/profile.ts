// MATRU OS — core profile. Single source of truth for identity & contact.
// All facts trace to the résumé. LinkedIn is reserved until provided.

export const profile = {
  name: 'Matru Prasad Panda',
  brand: 'MATRU OS',
  positioning: 'Data Analyst',
  tagline: 'Data. Intelligence. Leadership.',
  summary:
    'Data Analyst with strong expertise in SQL, Power BI, Excel, Python and Business Intelligence — experienced in data cleaning, dashboard creation, KPI analysis and reporting across real-world analytics projects. I have built end-to-end FMCG analytics systems and interactive dashboards for business decision-making. B.Tech graduate in Computer Science Engineering, honoured with a Best Internship Award and actively seeking Data Analyst opportunities.',
  roles: [
    'Data Analyst',
    'BI & Dashboards',
    'SQL & Python',
    'Researcher',
    'Problem Solver',
  ],

  // Contact (public)
  email: 'matruprasadpanda497@gmail.com',
  phone: '+91 9348201604',
  location: 'Dhenkanal, Odisha, India',
  github: 'https://github.com/matru-source',
  githubHandle: 'matru-source',
  linkedin: '', // TODO: paste linkedin.com/in/... URL when available
  resumeUrl: '', // upload a PDF from the admin (Profile → Résumé); button hides while empty
  // Hero portrait — save your photo as public/profile.jpg, or upload via admin (Profile → Profile photo).
  photo: '/profile.jpg',

  // Education
  degree: 'B.Tech in Computer Science & Engineering',
  college: 'Parala Maharaja Engineering College (PMEC), Berhampur',
  cgpa: '8',
  gradWindow: '2022 – 2026',
} as const

export type Profile = typeof profile
