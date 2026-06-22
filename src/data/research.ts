// MATRU OS — research data (Research Zone).

export interface ResearchPaper {
  key: string
  title: string
  venue: string
  year: string
  theme: string
  abstract: string
  contributions: string[]
  url?: string
}

export const research: ResearchPaper[] = [
  {
    key: 'icevb-2025',
    title: 'Fusing Ancient Astrology with Modern AI for Personalized Career Guidance',
    venue: 'ICEVB 2025',
    year: '2025',
    theme: 'AI + Astrology Integration',
    abstract:
      'A published research paper exploring the fusion of ancient astrology systems with modern AI and predictive analytics to deliver personalized career guidance.',
    contributions: [
      'Integrated traditional astrological frameworks with machine-learning predictive models.',
      'Proposed a pipeline for personalized, data-informed career guidance.',
    ],
    // url: '', // TODO: add DOI / publication link when available
  },
]
