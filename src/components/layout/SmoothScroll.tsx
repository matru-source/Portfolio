import { useEffect } from 'react'
import Lenis from 'lenis'
import { useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '@/hooks'

/**
 * Initializes Lenis smooth scrolling for luxurious inertial physics on desktop & trackpads.
 * Automatically respects prefers-reduced-motion and handles route changes.
 */
export function SmoothScroll() {
  const location = useLocation()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [reduced])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}
