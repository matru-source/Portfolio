// Projects data. All facts trace to the résumé; no fabricated metrics.

export interface Project {
  /** URL slug + key. */
  key: string
  name: string
  tagline: string
  domain: 'FMCG' | 'Food & Retail' | 'Aviation'
  tools: string[]
  summary: string
  highlights: string[]
  /** Qualitative outcomes (truthful, from résumé). */
  outcomes: string[]
  /** KPIs surfaced in the dashboard work. */
  kpis?: string[]
  featured?: boolean
  /** Optional dashboard screenshot (path under /public or an uploaded URL). */
  image?: string
  /** Additional dashboard / project screenshots (auto-slideshow). */
  images?: string[]
  /** Optional live link — opens the dashboard/report/repo in a new tab. */
  liveUrl?: string
}

export const projects: Project[] = [
  {
    key: 'fmcg',
    name: 'FMCG Sales & Distribution Analytics',
    tagline: 'End-to-end analytics across a multi-level distribution hierarchy.',
    domain: 'FMCG',
    tools: ['DOMO', 'SQL', 'Excel', 'Zoho Analytics'],
    summary:
      'An end-to-end FMCG analytics system for sales, inventory and KPI monitoring — with interactive dashboards and hierarchical reporting models that deliver actionable business insights for regional managers and CEO-level monitoring.',
    highlights: [
      'Built an end-to-end FMCG analytics system using SQL, Excel and Zoho Analytics for sales, inventory and KPI monitoring.',
      'Designed interactive dashboards and hierarchical reporting models for actionable business insights.',
      'Handled 2 lakh+ customer records across 25+ state-level datasets (distributors, salesmen, retailers).',
    ],
    outcomes: ['2 lakh+ records analyzed', '25+ state-level datasets', 'CEO + regional reporting'],
    kpis: ['Primary Sales', 'Secondary Sales', 'Inventory', 'DOH', 'Fill Rate'],
    featured: true,
  },
  {
    key: 'pizza',
    name: 'Pizza Sales Report',
    tagline: 'Revenue, customer behavior and sales performance in one BI dashboard.',
    domain: 'Food & Retail',
    tools: ['Power BI', 'SQL', 'SSMS', 'Python', 'Tableau'],
    summary:
      'Developed Power BI dashboards to analyze revenue trends, customer behavior and sales performance using SQL datasets.',
    highlights: [
      'Analyzed revenue trends and customer behavior across product categories.',
      'Surfaced sales-performance insights from SQL datasets.',
    ],
    outcomes: ['Revenue trend analysis', 'Customer behavior', 'Sales performance'],
    featured: true,
  },
  {
    key: 'airline',
    name: 'Airline Performance Analysis',
    tagline: 'Operational performance and trends from flight data.',
    domain: 'Aviation',
    tools: ['Python', 'Power BI', 'SQL', 'Tableau'],
    summary:
      'Performed airline operational data analysis and generated visualization dashboards using SQL, Power BI and Tableau (CTTC internship).',
    highlights: [
      'Identified operational trends and performance metrics from large airline datasets.',
      'Built visualization dashboards to support data-driven decisions.',
    ],
    outcomes: ['Operational metrics', 'Trend analysis', 'Interactive dashboards'],
    featured: true,
  },
]
