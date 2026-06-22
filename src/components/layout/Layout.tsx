import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { RouteMeta } from './RouteMeta'

/** App shell — sticky nav, routed page content, footer. */
export function Layout() {
  return (
    <>
      <ScrollToTop />
      <RouteMeta />
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-surface"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
