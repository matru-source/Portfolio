import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Use the alternate (canvas) background. */
  alt?: boolean
  /** Constrain inner width with the page container. */
  container?: boolean
}

/** Vertical page section with consistent rhythm. */
export function Section({ alt, container = true, className, children, ...props }: SectionProps) {
  return (
    <section className={cn('py-20 sm:py-28', alt && 'bg-canvas', className)} {...props}>
      {container ? <div className="container">{children}</div> : children}
    </section>
  )
}
