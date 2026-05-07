import { useState, useEffect } from 'react'

/** Counts elapsed seconds from when the hook first mounts. */
export function useElapsedSeconds(): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return elapsed
}
