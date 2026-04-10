export interface SessionSummary {
  id: string
  template_name: string | null
  started_at: string
  finished_at: string | null
  total_sets: number
  total_volume_kg: number
}
