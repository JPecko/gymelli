import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutHistory } from '@/features/workouts/hooks/useWorkoutHistory'
import { WorkoutSessionCard } from '@/features/workouts/components/WorkoutSessionCard'
import type { SessionHistoryItem } from '@/features/workouts/workouts.types'
import { Button, SwipeableItem, ConfirmSheet } from '@/shared/components'
import styles from './WorkoutsPage.module.scss'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] = useState<SessionHistoryItem | null>(null)
  const { sessions, scores, isLoading, handleDelete } = useWorkoutHistory()

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
            <SwipeableItem
              key={session.id}
              deleteLabel="Delete session"
              onDelete={() => setPendingDelete(session)}
            >
              <WorkoutSessionCard session={session} score={scores[i]} />
            </SwipeableItem>
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmSheet
          message="Delete this workout?"
          confirmLabel="Delete workout"
          onConfirm={() => {
            handleDelete(pendingDelete)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
