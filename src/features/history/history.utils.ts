import { getWeekStart, computeStreak } from '@/shared/lib/dates'
import type { VolumeWeek } from './history.types'

export { getWeekStart, computeStreak }

function formatWeekLabel(monday: Date): string {
  return monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function buildLast8Weeks(): VolumeWeek[] {
  const weeks: VolumeWeek[] = []
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const start = getWeekStart(d)
    weeks.push({
      week_label: formatWeekLabel(start),
      week_start: start.toISOString(),
      volume_kg: 0,
      session_count: 0,
    })
  }
  return weeks
}
