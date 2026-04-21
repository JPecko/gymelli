export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatDateCard(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Workout-level duration: "45m", "1h 30m" */
export function formatDuration(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Set-level duration: "30s", "1m 30s" */
export function formatSetDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** Compact volume without unit: "1.2k", "450" */
export function formatVolumeCompact(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k` : `${kg}`
}

/** Full volume with unit: "1.2t", "450 kg" */
export function formatVolumeFull(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg).toLocaleString()} kg`
}
