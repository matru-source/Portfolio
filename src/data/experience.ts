// Experience data.

export interface Experience {
  key: string
  org: string
  role: string
  location: string
  period: string
  domain: 'Analytics' | 'Cyber' | 'Teaching'
  highlights: string[]
  tools?: string[]
}

export const experience: Experience[] = [
  {
    key: 'nexus',
    org: 'Nexus Infotech',
    role: 'Data Analyst',
    location: 'Berhampur, Odisha',
    period: 'Nov 2025 – Present',
    domain: 'Analytics',
    highlights: [
      'Developed interactive FMCG dashboards and automated reports using SQL, Excel and Zoho Analytics for primary and secondary sales analysis.',
      'Handled and analyzed 2 lakh+ customer records and 25+ state-level datasets involving distributors, salesmen and retailer operations.',
      'Designed hierarchy-based reporting access for regional managers and CEO-level monitoring with KPI tracking, trend analysis and actionable insights.',
    ],
    tools: ['SQL', 'Excel', 'Zoho Analytics'],
  },
  {
    key: 'cttc',
    org: 'Central Tool Training Centre (CTTC)',
    role: 'Data Analyst Intern',
    location: 'Bhubaneswar',
    period: 'Apr 2023 – Sep 2023',
    domain: 'Analytics',
    highlights: [
      'Analyzed large airline datasets using SQL, Power BI and Excel to identify operational trends and performance metrics.',
      'Created interactive dashboards and visual reports to support data-driven decision-making and reporting.',
    ],
    tools: ['SQL', 'Power BI', 'Excel'],
  },
  {
    key: 'iit',
    org: 'Indian Institute of Technology (IIT), Jammu',
    role: 'Intern — Cybersecurity',
    location: 'Jammu',
    period: 'Feb 2025 – Jun 2025',
    domain: 'Cyber',
    highlights: [
      'Developed comprehensive technical documentation and implemented secure monitoring techniques.',
      'Improved network protection and threat-detection efficiency.',
    ],
    tools: ['Network Security', 'Documentation'],
  },
  {
    key: 'lecturer',
    org: 'Dhenkanal Autonomous College',
    role: 'Contract Lecturer',
    location: 'Dhenkanal, Odisha',
    period: 'Nov 2022 – Nov 2024',
    domain: 'Teaching',
    highlights: [
      'Instructed Retail Management and business processes, fostering academic excellence.',
      'Mentored students on advanced customer handling and core business concepts.',
    ],
  },
]
