export interface Exercise {
  id: string
  name: string
  muscle_group_id: string
  equipment_id: string | null
  type: 'compound' | 'isolation'
  instructions: string | null
}

export interface MuscleGroup {
  id: string
  name: string
}

export interface Equipment {
  id: string
  name: string
}
