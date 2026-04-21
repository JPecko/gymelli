import { useState, useEffect, useMemo } from 'react'
import { getSessionHistory, deleteSession } from '../workouts.api'
import { computeWorkoutScore } from './useWorkoutScore'
import { useProfile } from '@/features/auth/hooks/useProfile'
import type { SessionHistoryItem } from '../workouts.types'

export function useWorkoutHistory() {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { profile } = useProfile()

  useEffect(() => {
    getSessionHistory().then((data) => {
      setSessions(data)
      setIsLoading(false)
    })
  }, [])

  const scores = useMemo(
    () =>
      sessions.map((s) =>
        computeWorkoutScore({
          total_volume_kg: s.total_volume_kg,
          duration_seconds: s.duration_seconds,
          exercise_count: s.exercise_names.length,
          pr_count: s.pr_count,
          calories_burned: s.calories_burned,
          body_weight_kg: profile?.body_weight_kg ?? null,
          sex: profile?.sex ?? null,
          total_rest_seconds: s.total_rest_seconds,
        }),
      ),
    [sessions, profile?.body_weight_kg, profile?.sex],
  )

  function handleDelete(session: SessionHistoryItem) {
    setSessions((prev) => prev.filter((s) => s.id !== session.id))
    deleteSession(session.id).catch(() => {
      setSessions((prev) =>
        [...prev, session].sort(
          (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
        ),
      )
    })
  }

  return { sessions, scores, isLoading, handleDelete }
}
