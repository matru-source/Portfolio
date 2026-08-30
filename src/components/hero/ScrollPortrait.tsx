import { useEffect, useRef, useState, useCallback } from 'react'
import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

export const FRAME_COUNT = 300

function getFrameUrl(index: number): string {
  const frameNum = Math.min(FRAME_COUNT, Math.max(1, index + 1))
  const padded = String(frameNum).padStart(3, '0')
  return `/sequence/ezgif-frame-${padded}.jpg`
}

interface ScrollPortraitProps {
  scrollProgress?: number
  className?: string
}

/**
 * True Full-Screen Scroll-Driven Portrait Animation.
 * Fills 100% of the viewport width and height as an edge-to-edge canvas stage.
 * Smoothly blends into the warm cream background with no bounding boxes or card borders.
 */
export function ScrollPortrait({ scrollProgress = 0, className }: ScrollPortraitProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT).fill(null))
  const [initialReady, setInitialReady] = useState(false)
  const lastRenderedFrame = useRef<number>(-1)
  const currentLerpFrame = useRef<number>(0)

  // Draw frame across 100% full-screen canvas using object-cover scaling
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Find target frame or closest loaded keyframe
    let img = imagesRef.current[frameIndex]
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        const prev = imagesRef.current[frameIndex - offset]
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev
          break
        }
        const next = imagesRef.current[frameIndex + offset]
        if (next && next.complete && next.naturalWidth > 0) {
          img = next
          break
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return

    // Full-screen canvas sizing with high-DPI retina sharpness
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const targetWidth = Math.round(rect.width * dpr)
    const targetHeight = Math.round(rect.height * dpr)

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth || 1920
      canvas.height = targetHeight || 1080
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Full-bleed cover math to fill 100% of viewport edge-to-edge
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const imgRatio = 1280 / 720
    const canvasRatio = canvasWidth / canvasHeight

    let drawW = canvasWidth
    let drawH = canvasHeight
    let drawX = 0
    let drawY = 0

    if (canvasRatio > imgRatio) {
      // Screen is wider than 16:9
      drawW = canvasWidth
      drawH = canvasWidth / imgRatio
      drawY = (canvasHeight - drawH) / 2
    } else {
      // Screen is taller than 16:9
      drawH = canvasHeight
      drawW = canvasHeight * imgRatio
      drawX = (canvasWidth - drawW) / 2
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH)
    lastRenderedFrame.current = frameIndex
  }, [])

  // 1. Preload initial & final frames immediately for instant paint
  useEffect(() => {
    const firstImg = new Image()
    firstImg.src = getFrameUrl(0)
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg
      setInitialReady(true)
      drawFrame(0)
    }

    const lastImg = new Image()
    lastImg.src = getFrameUrl(FRAME_COUNT - 1)
    lastImg.onload = () => {
      imagesRef.current[FRAME_COUNT - 1] = lastImg
    }
  }, [drawFrame])

  // 2. Progressively preload remaining frames in background batches
  useEffect(() => {
    let cancelled = false

    const keyframeIndices: number[] = []
    for (let i = 0; i < FRAME_COUNT; i += 4) {
      if (i !== 0 && i !== FRAME_COUNT - 1) keyframeIndices.push(i)
    }

    const remainingIndices: number[] = []
    for (let i = 0; i < FRAME_COUNT; i++) {
      if (i % 4 !== 0 && i !== FRAME_COUNT - 1) remainingIndices.push(i)
    }

    const loadBatch = (indices: number[], onDone?: () => void) => {
      let batchLoaded = 0
      if (indices.length === 0) {
        onDone?.()
        return
      }

      indices.forEach((idx) => {
        if (cancelled) return
        const img = new Image()
        img.src = getFrameUrl(idx)
        img.onload = () => {
          if (cancelled) return
          imagesRef.current[idx] = img
          batchLoaded++
          if (batchLoaded === indices.length && onDone) {
            onDone()
          }
        }
        img.onerror = () => {
          if (cancelled) return
          batchLoaded++
          if (batchLoaded === indices.length && onDone) {
            onDone()
          }
        }
      })
    }

    loadBatch(keyframeIndices, () => {
      if (!cancelled) {
        loadBatch(remainingIndices)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  // 3. Smooth animation loop for frame scrubbing on scroll
  useEffect(() => {
    let rafId: number

    const renderLoop = () => {
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
      const targetFrame = Math.round(clampedProgress * (FRAME_COUNT - 1))

      if (reduced) {
        if (lastRenderedFrame.current !== targetFrame) {
          drawFrame(targetFrame)
        }
      } else {
        const frameDiff = targetFrame - currentLerpFrame.current
        if (Math.abs(frameDiff) > 0.05) {
          currentLerpFrame.current += frameDiff * 0.35
          const frameToDraw = Math.round(currentLerpFrame.current)
          if (lastRenderedFrame.current !== frameToDraw) {
            drawFrame(frameToDraw)
          }
        } else if (lastRenderedFrame.current !== targetFrame) {
          currentLerpFrame.current = targetFrame
          drawFrame(targetFrame)
        }
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(rafId)
  }, [scrollProgress, reduced, drawFrame])

  // Redraw on window resize to ensure full-bleed coverage
  useEffect(() => {
    const handleResize = () => {
      if (lastRenderedFrame.current >= 0) {
        drawFrame(lastRenderedFrame.current)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawFrame])

  return (
    <div
      className={cn(
        'absolute inset-0 h-full w-full overflow-hidden pointer-events-none select-none',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          'h-full w-full transition-opacity duration-500',
          initialReady ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          width: '100%',
          height: '100%',
          mixBlendMode: 'multiply',
          imageRendering: '-webkit-optimize-contrast',
        }}
      />
    </div>
  )
}
