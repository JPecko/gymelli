import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionHistory } from '@/features/workouts/workouts.api'
import { computeWorkoutScore } from '@/features/workouts/hooks/useWorkoutScore'
import { WorkoutSessionCard } from '@/features/workouts/components/WorkoutSessionCard'
import { useProfile } from '@/features/auth/hooks/useProfile'
import type { SessionHistoryItem } from '@/features/workouts/workouts.types'
import { Button } from '@/shared/components'
import styles from './WorkoutsPage.module.scss'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { profile } = useProfile()

  useEffect(() => {
    getSessionHistory().then((data) => {
      setSessions(data)
      setIsLoading(false)
    })
  }, [])

  const scores = useMemo(() =>
    sessions.map((s) =>
      computeWorkoutScore({
        total_volume_kg: s.total_volume_kg,
        duration_seconds: s.duration_seconds,
        exercise_count: s.exercise_names.length,
        pr_count: 0,  // PR history per-session requires expensive reconstruction; excluded here
        calories_burned: s.calories_burned,
        body_weight_kg: profile?.body_weight_kg ?? null,
        sex: profile?.sex ?? null,
        total_rest_seconds: s.total_rest_seconds,
      }),
    ),
  [sessions, profile?.body_weight_kg, profile?.sex])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Workouts</h1>
        <Button variant="primary" size="sm" onClick={() => navigate('/workouts/new')}>
          + Start
        </Button>
      </header>

      {isLoading && <p className={styles.state}>Loading...</p>}

      {!isLoading && sessions.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No workouts yet</p>
          <p className={styles.emptyText}>Start your first session to see it here.</p>
        </div>
      )}

      {!isLoading && sessions.length > 0 && (
        <div className={styles.list}>
          {sessions.map((session, i) => (
            <WorkoutSessionCard key={session.id} session={session} score={scores[i]} />
          ))}
        </div>
      )}
    </div>
  )
}
