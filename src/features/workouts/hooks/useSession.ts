import { useState, useEffect } from 'react'
import { getSessionById } from '../workouts.api'
import type { WorkoutSession } from '../workouts.types'

export function useSession(sessionId: string | undefined): WorkoutSession | null {
  const [session, setSession] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    if (!sessionId) return
    getSessionById(sessionId).then(setSession)
  }, [sessionId])

  return session
}
