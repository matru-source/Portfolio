// MATRU OS — skills matrix data.
// `level` is SELF-ASSESSED proficiency (0–100), surfaced as such in the UI.

export interface Skill {
  name: string
  /** Self-assessed proficiency 0–100. */
  level: number
  /** Where it was used / context. */
  note?: string
}

export interface SkillCategory {
  key: string
  label: string
  /** Accent token name for charts/bars. */
  accent: 'primary' | 'cyan' | 'gold' | 'success' | 'danger'
  items: Skill[]
}

export const skillCategories: SkillCategory[] = [
  {
    key: 'bi',
    label: 'BI & Visualization',
    accent: 'primary',
    items: [
      { name: 'Power BI', level: 88, note: 'Airline & pizza dashboards' },
      { name: 'Zoho Analytics', level: 86, note: 'FMCG dashboards' },
      { name: 'Excel (Pivot, Dashboards, VLOOKUP)', level: 88 },
      { name: 'Tableau', level: 78 },
      { name: 'DOMO', level: 74 },
      { name: 'KPI Reporting', level: 84 },
      { name: 'Data Visualization', level: 85 },
      { name: 'Google Analytics', level: 70 },
    ],
  },
  {
    key: 'databases',
    label: 'Databases',
    accent: 'success',
    items: [
      { name: 'MS SQL Server', level: 86 },
      { name: 'SSMS', level: 84 },
      { name: 'PostgreSQL', level: 74 },
      { name: 'MongoDB', level: 68 },
    ],
  },
  {
    key: 'programming',
    label: 'Programming',
    accent: 'gold',
    items: [
      { name: 'SQL', level: 88, note: 'Querying, joins, reporting' },
      { name: 'Python (Pandas, NumPy, scikit-learn)', level: 82 },
      { name: 'Java', level: 70 },
      { name: 'C', level: 68 },
    ],
  },
  {
    key: 'data',
    label: 'Data Handling',
    accent: 'cyan',
    items: [
      { name: 'Data Cleaning', level: 88 },
      { name: 'Business Metrics', level: 84 },
      { name: 'Trend Analysis', level: 82 },
      { name: 'Data Modeling', level: 80 },
      { name: 'ETL Concepts', level: 80 },
      { name: 'Process Improvement', level: 78 },
      { name: 'Statistical Analysis', level: 76 },
    ],
  },
  {
    key: 'cyber',
    label: 'Cybersecurity',
    accent: 'danger',
    items: [
      { name: 'Secure Monitoring', level: 74, note: 'IIT Jammu internship' },
      { name: 'Network Protection', level: 72 },
      { name: 'Threat Detection', level: 70 },
      { name: 'Ethical Hacking', level: 72, note: 'IIT Jammu certification' },
    ],
  },
]
