import { useCountdown } from '@/shared/hooks/useCountdown'
import { Button } from '@/shared/components'
import styles from './RestTimer.module.scss'

const DEFAULT_DURATION = 90 // seconds

interface RestTimerProps {
  durationSeconds?: number
  onDismiss: () => void
}

export function RestTimer({ durationSeconds = DEFAULT_DURATION, onDismiss }: RestTimerProps) {
  const { progress, display } = useCountdown(durationSeconds, onDismiss)

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p className={styles.label}>Rest</p>

        <div className={styles.ring}>
          <svg className={styles.svg} viewBox="0 0 100 100">
            <circle className={styles.track} cx="50" cy="50" r="44" />
            <circle
              className={styles.fill}
              cx="50"
              cy="50"
              r="44"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
            />
          </svg>
          <span className={styles.time}>{display}</span>
        </div>

        <Button variant="ghost" size="lg" fullWidth onClick={onDismiss}>
          Skip Rest
        </Button>
      </div>
    </div>
  )
}
