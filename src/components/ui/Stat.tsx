import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks'

interface StatProps {
  value: string | number
  label: string
  className?: string
}

/**
 * Animated KPI Stat component that counts up smoothly on scroll into viewport.
 */
export function Stat({ value, label, className }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = usePrefersReducedMotion()
  const [displayValue, setDisplayValue] = useState(reduced ? String(value) : '0')

  useEffect(() => {
    const raw = String(value).trim()
    if (reduced || !isInView) {
      if (reduced) setDisplayValue(raw)
      return
    }

    // Match numeric portion vs prefix / suffix, including decimals and leading zero
    const match = raw.match(/^([^0-9.]*)(\d+(?:\.\d+)?)(.*)$/)
    if (!match) {
      setDisplayValue(raw)
      return
    }

    const [, prefix, numStr, suffix] = match
    const targetNum = parseFloat(numStr)
    const isFloat = numStr.includes('.')
    const decimals = isFloat ? numStr.split('.')[1].length : 0
    const padZeros = numStr.startsWith('0') && numStr.length > 1 && !isFloat ? numStr.length : 0

    const startTime = performance.now()
    const duration = 1200

    let rafId: number
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentNum = targetNum * eased

      let formatted = isFloat ? currentNum.toFixed(decimals) : Math.round(currentNum).toString()
      if (padZeros) {
        formatted = formatted.padStart(padZeros, '0')
      }

      setDisplayValue(`${prefix}${formatted}${suffix}`)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setDisplayValue(raw)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isInView, value, reduced])

  return (
    <div ref={ref} className={className}>
      <div className="font-display text-4xl font-medium text-ink sm:text-5xl">
        {displayValue}
      </div>
      <div className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  )
}
