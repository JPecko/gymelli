import { useState, useEffect, useCallback, useRef } from 'react'
import type { Exercise } from '@/features/exercises/exercises.types'
import { getExerciseById } from '@/features/exercises/exercises.api'
import {
  getSessionExercises,
  logSet,
  deleteSet,
  getPreviousSetsForExercise,
  finishSession,
  addSessionExercise,
} from '../workouts.api'
import type { WorkoutSession, WorkoutSessionExercise, ExerciseSet } from '../workouts.types'

export interface DraftSet {
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
  distance_km: number | null
  is_active: boolean
  is_completed: boolean
  logged_id: string | null
}

export interface SessionExerciseState {
  session_exercise: WorkoutSessionExercise
  exercise: Exercise
  sets: DraftSet[]
  previous_sets: ExerciseSet[]
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

function bwDefault(exercise: Exercise, body_weight_kg: number | null): number | null {
  if (exercise.tracking_type !== 'reps_only' || !body_weight_kg) return null
  return Math.round(body_weight_kg * (exercise.effective_bw_factor ?? 0.6) * 10) / 10
}

function buildInitialSets(
  previousSets: ExerciseSet[],
  se: WorkoutSessionExercise,
  exercise: Exercise,
  body_weight_kg: number | null,
): DraftSet[] {
  const hasPrevious = previousSets.length > 0
  const count = hasPrevious ? previousSets.length : (se.default_sets ?? 1)
  const defaultKg = bwDefault(exercise, body_weight_kg)
  return Array.from({ length: count }, (_, i) => ({
    weight_kg: previousSets[i]?.weight_kg ?? defaultKg,
    reps: previousSets[i]?.reps ?? (!hasPrevious ? (se.default_reps ?? null) : null),
    duration_seconds: previousSets[i]?.duration_seconds ?? null,
    distance_km: previousSets[i]?.distance_km ?? null,
    is_active: false,
    is_completed: false,
    logged_id: null,
  }))
}

// Returns a state updater that patches a single DraftSet within exercises state.
function patchSet(exIdx: number, setIdx: number, patch: Partial<DraftSet>) {
  return (prev: SessionExerciseState[]): SessionExerciseState[] =>
    prev.map((ex, i) =>
      i !== exIdx
        ? ex
        : { ...ex, sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, ...patch })) },
    )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkoutSession(session: WorkoutSession, body_weight_kg: number | null = null) {
  const [exercises, setExercises] = useState<SessionExerciseState[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)
  const [restTimerActive, setRestTimerActive] = useState(false)
  const [restTimerDuration, setRestTimerDuration] = useState(90)
  const [totalRestSeconds, setTotalRestSeconds] = useState(0)
  const bwFilled = useRef(false)

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
            sets: buildInitialSets(previousSets, se, exercise, body_weight_kg),
            previous_sets: previousSets,
          }
        }),
      )
      setExercises(states)
      if (body_weight_kg) bwFilled.current = true
      setIsLoading(false)
    }
    load()
  }, [session.id])

  // Late-fill: body weight loaded after exercises (profile async)
  useEffect(() => {
    if (!body_weight_kg || exercises.length === 0 || bwFilled.current) return
    bwFilled.current = true
    setExercises((prev) =>
      prev.map((ex) => {
        const defaultKg = bwDefault(ex.exercise, body_weight_kg)
        if (!defaultKg) return ex
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.weight_kg !== null ? s : { ...s, weight_kg: defaultKg },
          ),
        }
      }),
    )
  }, [body_weight_kg, exercises.length])

  const updateDraftSet = useCallback(
    (exIdx: number, setIdx: number, field: 'weight_kg' | 'reps' | 'duration_seconds' | 'distance_km', value: number | null) => {
      setExercises(patchSet(exIdx, setIdx, { [field]: value }))
    },
    [],
  )

  const startSet = useCallback((exIdx: number, setIdx: number) => {
    setExercises(patchSet(exIdx, setIdx, { is_active: true }))
  }, [])

  const confirmSet = useCallback(
    async (exIdx: number, setIdx: number) => {
      const ex = exercises[exIdx]
      const set = ex.sets[setIdx]
      if (set.is_completed) return

      setExercises(patchSet(exIdx, setIdx, { is_completed: true, is_active: false }))
      setRestTimerDuration(ex.session_exercise.rest_seconds ?? 90)
      setRestTimerActive(true)

      try {
        const logged = await logSet({
          session_exercise_id: ex.session_exercise.id,
          set_number: setIdx + 1,
          weight_kg: set.weight_kg,
          reps: set.reps,
          duration_seconds: set.duration_seconds,
          distance_km: set.distance_km,
          rpe: null,
        })
        setExercises(patchSet(exIdx, setIdx, { logged_id: logged.id }))
      } catch {
        setExercises(patchSet(exIdx, setIdx, { is_completed: false, is_active: true }))
      }
    },
    [exercises],
  )

  const addSet = useCallback((exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets.at(-1)
        const newSet: DraftSet = {
          weight_kg: last?.weight_kg ?? null,
          reps: last?.reps ?? null,
          duration_seconds: last?.duration_seconds ?? null,
          distance_km: last?.distance_km ?? null,
          is_active: false,
          is_completed: false,
          logged_id: null,
        }
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

  const addExercise = useCallback(
    async (exerciseId: string) => {
      const orderIndex = exercises.length
      const [se, exercise, previousSets] = await Promise.all([
        addSessionExercise(session.id, exerciseId, orderIndex),
        getExerciseById(exerciseId),
        getPreviousSetsForExercise(exerciseId, session.id),
      ])
      const newState: SessionExerciseState = {
        session_exercise: se,
        exercise,
        sets: buildInitialSets(previousSets, se, exercise, body_weight_kg),
        previous_sets: previousSets,
      }
      setExercises((prev) => [...prev, newState])
      setActiveIndex(orderIndex)
    },
    [exercises.length, session.id, body_weight_kg],
  )

  const finishWorkout = useCallback(async () => {
    setIsFinishing(true)
    await finishSession(session.id, totalRestSeconds)
  }, [session.id, totalRestSeconds])

  const dismissRestTimer = useCallback((elapsedSeconds: number) => {
    setRestTimerActive(false)
    setTotalRestSeconds((prev) => prev + elapsedSeconds)
  }, [])

  return {
    exercises,
    active_index: activeIndex,
    is_loading: isLoading,
    is_finishing: isFinishing,
    rest_timer_active: restTimerActive,
    rest_timer_duration: restTimerDuration,
    total_rest_seconds: totalRestSeconds,
    goToExercise: setActiveIndex,
    updateDraftSet,
    startSet,
    confirmSet,
    addSet,
    removeSet,
    addExercise,
    finishWorkout,
    dismissRestTimer,
  }
}
