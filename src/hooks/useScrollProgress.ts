import { useEffect, useState } from 'react'

/**
 * Phase 0: normalized [0,1] window scroll progress.
 * Phase 1: driven by Lenis and fed to GSAP ScrollTrigger + the scroll-mode WorldRouter.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return progress
}
