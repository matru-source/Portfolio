import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

/** Clean white surface card. */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  ),
)

Card.displayName = 'Card'
