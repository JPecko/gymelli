export interface Profile {
  id: string
  email: string
  display_name: string | null
  body_weight_kg: number | null
  sex: 'M' | 'F' | null
  created_at: string
}
