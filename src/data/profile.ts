// MATRU OS — core profile. Single source of truth for identity & contact.
// All facts trace to the résumé. LinkedIn is reserved until provided.

export const profile = {
  name: 'Matru Prasad Panda',
  brand: 'MATRU OS',
  positioning: 'Full Stack Developer | Data Analyst | AI & Business Intelligence',
  tagline: 'Building Software. Turning Data Into Intelligence.',
  summary:
    'Full Stack Developer and Data Analyst with professional experience at Nexus Infotech and a B.Tech in Computer Science & Engineering. Experienced in developing enterprise web applications, Business Intelligence platforms, data analytics solutions, AI-powered applications, and automation systems using TypeScript, React, Next.js, Node.js, Python, SQL, PostgreSQL, Power BI, Zoho Analytics, Tableau, and Excel. Skilled in software development, application architecture, REST APIs, database design, authentication, data modeling, ETL, KPI reporting, dashboard development, cloud deployment, and data-driven decision-making.',
  roles: [
    'Full Stack Developer',
    'Data Analyst',
    'Business Intelligence',
    'Data Visualization',
    'AI Integration',
    'Generative AI',
    'Agentic AI',
    'Software Engineering',
    'Automation',
    'Problem Solver',
  ],

  // Contact (public)
  email: 'itsmatruprasad@gmail.com',
  phone: '+91 9348201604',
  location: 'Berhampur, Odisha, India',
  github: 'https://github.com/matru-source',
  githubHandle: 'matru-source',
  linkedin: 'https://www.linkedin.com/in/itsmatru',
  resumeUrl: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/resume/1787160725990-Matru_Prasad_Panda_Resume.pdf.pdf',
  photo: 'https://euibyfjcwqjapbnlzqbs.supabase.co/storage/v1/object/public/Media/uploads/1782124544141-PASSPORT_PIC.jpg',
  photos: [] as string[],

  // Education
  degree: 'B.Tech in Computer Science & Engineering',
  college: 'Parala Maharaja Engineering College (PMEC), Berhampur',
  cgpa: '7.88',
  gradWindow: '2022 – 2026',
} as const

export type Profile = typeof profile
