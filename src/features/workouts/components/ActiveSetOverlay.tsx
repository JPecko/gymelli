import clsx from 'clsx'
import { Button } from '@/shared/components'
import { useElapsedSeconds } from '@/shared/hooks/useElapsedSeconds'
import type { DraftSet } from '../hooks/useWorkoutSession'
import type { TrackingType } from '@/features/exercises/exercises.types'
import styles from './ActiveSetOverlay.module.scss'

interface ActiveSetOverlayProps {
  set: DraftSet
  setIndex: number
  trackingType: TrackingType
  onConfirm: () => void
  onDismiss: () => void
}

const UP_REF_SECONDS = 90 // ring fills completely over this many elapsed seconds

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function buildValueLabel(set: DraftSet, tracking: TrackingType): string {
  if (tracking === 'weight_reps') {
    const kg   = set.weight_kg  != null ? `${set.weight_kg} kg`  : '—'
    const reps = set.reps       != null ? `${set.reps} reps`     : '—'
    return `${kg} × ${reps}`
  }
  if (tracking === 'reps_only') return set.reps           != null ? `${set.reps} reps`      : '—'
  if (tracking === 'duration')  return set.duration_seconds != null ? `${set.duration_seconds}s` : '—'
  return set.distance_km != null ? `${set.distance_km} km` : '—'
}

export function ActiveSetOverlay({ set, setIndex, trackingType, onConfirm, onDismiss }: ActiveSetOverlayProps) {
  const isDuration   = trackingType === 'duration'
  const targetSec    = isDuration ? (set.duration_seconds ?? 30) : UP_REF_SECONDS

  const elapsed = useElapsedSeconds()

  const countdown    = Math.max(0, targetSec - elapsed)
  const isTimeUp     = isDuration && elapsed >= targetSec
  const displayTime  = isDuration ? countdown : elapsed
  const progress     = isDuration
    ? countdown / targetSec                          // ring drains as time passes
    : Math.min(elapsed / UP_REF_SECONDS, 1)         // ring fills up

  const circumference = 2 * Math.PI * 44
  const valueLabel = buildValueLabel(set, trackingType)

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p className={styles.setLabel}>Set {setIndex}</p>

        <p className={clsx(styles.values, isTimeUp && styles.valuesTimeUp)}>
          {valueLabel}
        </p>

        <div className={styles.ring}>
          <svg className={styles.svg} viewBox="0 0 100 100">
            <circle className={styles.track} cx="50" cy="50" r="44" />
            <circle
              className={clsx(styles.fill, isTimeUp && styles.fillTimeUp)}
              cx="50" cy="50" r="44"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div className={styles.ringCenter}>
            <span className={clsx(styles.time, isTimeUp && styles.timeTimeUp)}>
              {isTimeUp ? 'Time!' : formatTimer(displayTime)}
            </span>
            <span className={styles.timeSubLabel}>
              {isDuration ? (isTimeUp ? 'target reached' : 'remaining') : 'elapsed'}
            </span>
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={onConfirm}>
          Done
        </Button>
      </div>
    </div>
  )
}
