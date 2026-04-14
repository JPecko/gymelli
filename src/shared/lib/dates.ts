// Returns the Monday of the week containing `date`, at midnight local time.
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = week start
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Counts consecutive days with a session up to today.
// Allows today to be missing (workout not yet done).
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
