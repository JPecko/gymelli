import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSession } from '@/features/workouts'
import { Button } from '@/shared/components'
import styles from './WorkoutsPage.module.scss'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setLoading(true)
    setError(null)
    try {
      const session = await startSession(null)
      navigate(`/workouts/session/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Workouts</h1>
      <Button variant="secondary" onClick={handleStart} disabled={loading}>
        {loading ? 'Starting...' : '+ Start Workout'}
      </Button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
