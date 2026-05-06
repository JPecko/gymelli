import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSession, addSessionExercise } from '../workouts.api'

export interface SessionExerciseInput {
  exercise_id: string
  rest_seconds?: number | null
  default_sets?: number | null
  default_reps?: number | null
}

export function useStartWorkoutSession() {
  const navigate = useNavigate()
  const [isStarting, setIsStarting] = useState(false)

  async function start(templateId: string | null, exercises: SessionExerciseInput[]) {
    if (isStarting) return
    setIsStarting(true)
    try {
      const session = await startSession(templateId)
      await Promise.all(
        exercises.map((ex, i) =>
          addSessionExercise(session.id, ex.exercise_id, i, ex.rest_seconds, ex.default_sets, ex.default_reps),
        ),
      )
      navigate(`/workouts/session/${session.id}`)
    } catch {
      setIsStarting(false)
    }
  }

  return { start, isStarting }
}
