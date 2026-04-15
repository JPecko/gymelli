import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/shared/components'
import styles from './RestTimer.module.scss'

const DEFAULT_DURATION = 90

interface RestTimerProps {
  durationSeconds?: number
  onDismiss: (elapsedSeconds: number) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60)
  const s = Math.abs(seconds) % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RestTimer({ durationSeconds = DEFAULT_DURATION, onDismiss }: RestTimerProps) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const isOvertime = elapsed >= durationSeconds
  const countdown = Math.max(0, durationSeconds - elapsed)
  const overtime = elapsed - durationSeconds
  const progress = isOvertime ? 0 : countdown / durationSeconds

  const circumference = 2 * Math.PI * 44

  return (
    <div className={styles.overlay} onClick={() => onDismiss(elapsed)}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p className={clsx(styles.label, isOvertime && styles.labelOvertime)}>
          {isOvertime ? 'Overtime' : 'Rest'}
        </p>

        <div className={styles.ring}>
          <svg className={styles.svg} viewBox="0 0 100 100">
            <circle className={styles.track} cx="50" cy="50" r="44" />
            <circle
              className={clsx(styles.fill, isOvertime && styles.fillOvertime)}
              cx="50" cy="50" r="44"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <span className={clsx(styles.time, isOvertime && styles.timeOvertime)}>
            {isOvertime ? `+${formatTime(overtime)}` : formatTime(countdown)}
          </span>
        </div>

        <Button
          variant={isOvertime ? 'primary' : 'ghost'}
          size="lg"
          fullWidth
          onClick={() => onDismiss(elapsed)}
        >
          {isOvertime ? 'Continue' : 'Skip Rest'}
        </Button>
      </div>
    </div>
  )
}
