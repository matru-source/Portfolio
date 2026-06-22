import { useEffect, useRef, type MutableRefObject } from 'react'

export interface ParallaxValue {
  x: number
  y: number
}

/**
 * Tracks the pointer as a normalized [-1, 1] vector in a ref (transient — no
 * re-render). Consumers read ref.current inside rAF / useFrame, honoring the
 * "3D reads state without re-rendering React" rule.
 */
export function useMouseParallax(strength = 1): MutableRefObject<ParallaxValue> {
  const ref = useRef<ParallaxValue>({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth - 0.5) * 2 * strength
      ref.current.y = (e.clientY / window.innerHeight - 0.5) * 2 * strength
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [strength])

  return ref
}
