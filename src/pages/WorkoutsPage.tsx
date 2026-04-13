import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components'
import styles from './WorkoutsPage.module.scss'

export function WorkoutsPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Workouts</h1>
      <Button variant="secondary" onClick={() => navigate('/workouts/new')}>
        + Start Workout
      </Button>
    </div>
  )
}
