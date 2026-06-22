import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
  className?: string
  /** Heading level — use 'h1' once per page (the primary page heading). */
  as?: 'h1' | 'h2'
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  className,
  as: Heading = 'h2',
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      )}
      <Heading className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-body">{subtitle}</p>}
    </div>
  )
}
