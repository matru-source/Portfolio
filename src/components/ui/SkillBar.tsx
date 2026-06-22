import { motion } from 'framer-motion'
import type { SkillCategory } from '@/data'
import { cn } from '@/lib/cn'

const accentClass: Record<SkillCategory['accent'], string> = {
  primary: 'bg-primary',
  cyan: 'bg-accent',
  gold: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-danger',
}

interface SkillBarProps {
  name: string
  /** Self-assessed proficiency 0–100. */
  level: number
  accent: SkillCategory['accent']
}

export function SkillBar({ name, level, accent }: SkillBarProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{name}</span>
        <span className="font-mono text-xs text-muted">{level}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
        <motion.div
          className={cn('h-full rounded-full', accentClass[accent])}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
