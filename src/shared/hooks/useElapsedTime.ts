import { useState, useEffect } from 'react'

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function useElapsedTime(startedAt: string): string {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startedAt).getTime()

    function tick() {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return formatElapsed(elapsed)
}
