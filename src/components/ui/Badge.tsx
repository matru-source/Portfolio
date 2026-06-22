import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'primary' | 'accent'
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'border-line bg-white text-muted',
  primary: 'border-primary-100 bg-primary-50 text-primary-600',
  accent: 'border-accent/20 bg-accent/10 text-accent-600',
}

/** Small pill used for tools / tags. */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
