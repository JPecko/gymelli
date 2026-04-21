import type { VolumeWeek } from '../history.types'
import { formatVolumeCompact } from '@/shared/lib/formatters'
import styles from './VolumeChart.module.scss'

interface VolumeChartProps {
  weeks: VolumeWeek[]
}

export function VolumeChart({ weeks }: VolumeChartProps) {
  const maxVolume = Math.max(...weeks.map((w) => w.volume_kg), 1)
  const currentWeekStart = (() => {
    const d = new Date()
    const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  })()

  return (
    <div className={styles.chart}>
      {weeks.map((week) => {
        const heightPct = (week.volume_kg / maxVolume) * 100
        const isCurrent = week.week_start >= currentWeekStart
        return (
          <div key={week.week_start} className={styles.column}>
            <div className={styles.barWrap}>
              {week.volume_kg > 0 && (
                <span className={styles.barValue}>{formatVolumeCompact(week.volume_kg)}</span>
              )}
              {/* inline style is intentional — dynamic computed value */}
              <div
                className={styles.bar}
                style={{ height: `${Math.max(heightPct, week.volume_kg > 0 ? 4 : 0)}%` }}
                data-current={isCurrent || undefined}
              />
            </div>
            <span className={styles.weekLabel}>{week.week_label}</span>
          </div>
        )
      })}
    </div>
  )
}
