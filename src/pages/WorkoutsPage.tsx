import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionHistory } from '@/features/workouts/workouts.api'
import { WorkoutSessionCard } from '@/features/workouts/components/WorkoutSessionCard'
import type { SessionHistoryItem } from '@/features/workouts/workouts.types'
import { Button } from '@/shared/components'
import styles from './WorkoutsPage.module.scss'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSessionHistory().then((data) => {
      setSessions(data)
      setIsLoading(false)
    })
  }, [])

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
          {sessions.map((session) => (
            <WorkoutSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
