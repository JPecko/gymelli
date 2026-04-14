import { useState, useEffect } from 'react'

interface CountdownResult {
  remaining: number
  progress: number // 1.0 (full) → 0.0 (done)
  display: string  // "M:SS"
}

/**
 * Counts down from `totalSeconds` to 0, calling `onComplete` at 0.
 * `totalSeconds` is read once on mount — changes mid-countdown are ignored.
 */
export function useCountdown(totalSeconds: number, onComplete: () => void): CountdownResult {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (remaining <= 0) {
      onComplete()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onComplete])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60

  return {
    remaining,
    progress: remaining / totalSeconds,
    display: `${m}:${String(s).padStart(2, '0')}`,
  }
}
