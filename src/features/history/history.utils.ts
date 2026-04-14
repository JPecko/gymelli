import type { VolumeWeek } from './history.types'

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = week start
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatWeekLabel(monday: Date): string {
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

// Counts consecutive days with a session up to today.
// Allows today to be missing (workout not done yet).
export function computeStreak(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0
  const days = new Set(
    sessionDates.map((d) => new Date(d).toLocaleDateString('en-CA')), // YYYY-MM-DD
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (days.has(d.toLocaleDateString('en-CA'))) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}
