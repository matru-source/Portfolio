import { Link } from 'react-router-dom'
import { buttonStyles } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-body">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link to="/" className={buttonStyles('primary', 'md', 'mt-8')}>
        Back home
      </Link>
    </div>
  )
}
