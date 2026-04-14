import { useState, useEffect, useCallback } from 'react'
import type { Exercise } from '@/features/exercises/exercises.types'
import { getExerciseById } from '@/features/exercises/exercises.api'
import {
  getSessionExercises,
  logSet,
  deleteSet,
  getPreviousSetsForExercise,
  finishSession,
} from '../workouts.api'
import type { WorkoutSession, WorkoutSessionExercise, ExerciseSet } from '../workouts.types'

export interface DraftSet {
  weight_kg: number | null
  reps: number | null
  is_completed: boolean
  logged_id: string | null
}

export interface SessionExerciseState {
  session_exercise: WorkoutSessionExercise
  exercise: Exercise
  sets: DraftSet[]
  previous_sets: ExerciseSet[]
}

function buildInitialSets(previousSets: ExerciseSet[]): DraftSet[] {
  const count = previousSets.length > 0 ? previousSets.length : 3
  return Array.from({ length: count }, (_, i) => ({
    weight_kg: previousSets[i]?.weight_kg ?? null,
    reps: previousSets[i]?.reps ?? null,
    is_completed: false,
    logged_id: null,
  }))
}

export function useWorkoutSession(session: WorkoutSession) {
  const [exercises, setExercises] = useState<SessionExerciseState[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)
  const [restTimerActive, setRestTimerActive] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const sessionExercises = await getSessionExercises(session.id)

      const states = await Promise.all(
        sessionExercises.map(async (se) => {
          const [exercise, previousSets] = await Promise.all([
            getExerciseById(se.exercise_id),
            getPreviousSetsForExercise(se.exercise_id, session.id),
          ])
          return {
            session_exercise: se,
            exercise,
            sets: buildInitialSets(previousSets),
            previous_sets: previousSets,
          }
        }),
      )

      setExercises(states)
      setIsLoading(false)
    }

    load()
  }, [session.id])

  const updateDraftSet = useCallback(
    (exIdx: number, setIdx: number, field: 'weight_kg' | 'reps', value: number | null) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i !== exIdx
            ? ex
            : { ...ex, sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, [field]: value })) },
        ),
      )
    },
    [],
  )

  const confirmSet = useCallback(
    async (exIdx: number, setIdx: number) => {
      const ex = exercises[exIdx]
      const set = ex.sets[setIdx]
      if (set.is_completed) return

      setExercises((prev) =>
        prev.map((e, i) =>
          i !== exIdx
            ? e
            : { ...e, sets: e.sets.map((s, j) => (j !== setIdx ? s : { ...s, is_completed: true })) },
        ),
      )
      setRestTimerActive(true)

      try {
        const logged = await logSet({
          session_exercise_id: ex.session_exercise.id,
          set_number: setIdx + 1,
          weight_kg: set.weight_kg,
          reps: set.reps,
          rpe: null,
        })
        setExercises((prev) =>
          prev.map((e, i) =>
            i !== exIdx
              ? e
              : { ...e, sets: e.sets.map((s, j) => (j !== setIdx ? s : { ...s, logged_id: logged.id })) },
          ),
        )
      } catch {
        setExercises((prev) =>
          prev.map((e, i) =>
            i !== exIdx
              ? e
              : { ...e, sets: e.sets.map((s, j) => (j !== setIdx ? s : { ...s, is_completed: false })) },
          ),
        )
      }
    },
    [exercises],
  )

  const addSet = useCallback((exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets.at(-1)
        const newSet: DraftSet = { weight_kg: last?.weight_kg ?? null, reps: last?.reps ?? null, is_completed: false, logged_id: null }
        return { ...ex, sets: [...ex.sets, newSet] }
      }),
    )
  }, [])

  const removeSet = useCallback(
    async (exIdx: number, setIdx: number) => {
      const set = exercises[exIdx].sets[setIdx]
      if (set.logged_id) await deleteSet(set.logged_id)
      setExercises((prev) =>
        prev.map((ex, i) =>
          i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) },
        ),
      )
    },
    [exercises],
  )

  const finishWorkout = useCallback(async () => {
    setIsFinishing(true)
    await finishSession(session.id)
  }, [session.id])

  const dismissRestTimer = useCallback(() => {
    setRestTimerActive(false)
  }, [])

  return {
    exercises,
    active_index: activeIndex,
    is_loading: isLoading,
    is_finishing: isFinishing,
    rest_timer_active: restTimerActive,
    goToExercise: setActiveIndex,
    updateDraftSet,
    confirmSet,
    addSet,
    removeSet,
    finishWorkout,
    dismissRestTimer,
  }
}
