import { useRef } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  /** Minimum horizontal px to trigger (default: 50) */
  threshold?: number
}

/**
 * Returns touch handlers that detect horizontal swipe gestures.
 * Only fires when the gesture is primarily horizontal (|dx| > |dy|),
 * so it doesn't conflict with vertical scrolling or nested swipe components.
 */
export function useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeGestureOptions) {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null || startY.current === null) return

    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current

    startX.current = null
    startY.current = null

    // Only trigger if movement is primarily horizontal
    if (Math.abs(dx) < Math.abs(dy)) return
    if (Math.abs(dx) < threshold) return

    if (dx < 0) onSwipeLeft?.()
    else onSwipeRight?.()
  }

  return { onTouchStart, onTouchEnd }
}
