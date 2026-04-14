import { useState, useEffect, useCallback } from 'react'
import { getExercisesByIds } from '@/features/exercises/exercises.api'
import type { Exercise } from '@/features/exercises/exercises.types'
import {
  getTemplateById,
  getTemplateExercises,
  createTemplate,
  updateTemplate,
  addTemplateExercise,
  removeTemplateExercise,
} from '../templates.api'

export interface DraftExercise {
  exercise: Exercise
  default_sets: number
  default_reps: number
  rest_seconds: number
}

export function useTemplateEditor(templateId?: string) {
  const [name, setName] = useState('')
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!templateId) return
    setIsLoading(true)
    Promise.all([getTemplateById(templateId), getTemplateExercises(templateId)]).then(
      async ([template, templateExercises]) => {
        setName(template.name)
        const exercises = await getExercisesByIds(templateExercises.map((te) => te.exercise_id))
        const exerciseMap = new Map(exercises.map((ex) => [ex.id, ex]))
        const drafts = templateExercises.map((te) => ({
          exercise: exerciseMap.get(te.exercise_id)!,
          default_sets: te.default_sets ?? 3,
          default_reps: te.default_reps ?? 8,
          rest_seconds: te.rest_seconds ?? 90,
        }))
        setDraftExercises(drafts)
        setIsLoading(false)
      },
    )
  }, [templateId])

  const addExercise = useCallback((exercise: Exercise) => {
    setDraftExercises((prev) =>
      prev.find((e) => e.exercise.id === exercise.id)
        ? prev
        : [...prev, { exercise, default_sets: 3, default_reps: 8, rest_seconds: 90 }],
    )
  }, [])

  const removeExercise = useCallback((index: number) => {
    setDraftExercises((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const moveUp = useCallback((index: number) => {
    if (index === 0) return
    setDraftExercises((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveDown = useCallback((index: number) => {
    setDraftExercises((prev) => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [])

  const updateDefault = useCallback(
    (index: number, field: 'default_sets' | 'default_reps' | 'rest_seconds', value: number) => {
      setDraftExercises((prev) =>
        prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
      )
    },
    [],
  )

  const save = useCallback(async (): Promise<string> => {
    setIsSaving(true)
    try {
      let savedId: string

      if (templateId) {
        await updateTemplate(templateId, name)
        const existing = await getTemplateExercises(templateId)
        await Promise.all(existing.map((te) => removeTemplateExercise(te.id)))
        savedId = templateId
      } else {
        const template = await createTemplate(name)
        savedId = template.id
      }

      await Promise.all(
        draftExercises.map((ex, i) =>
          addTemplateExercise(savedId, ex.exercise.id, i, {
            default_sets: ex.default_sets,
            default_reps: ex.default_reps,
            rest_seconds: ex.rest_seconds,
          }),
        ),
      )

      return savedId
    } finally {
      setIsSaving(false)
    }
  }, [templateId, name, draftExercises])

  return {
    name,
    setName,
    draftExercises,
    isLoading,
    isSaving,
    addExercise,
    removeExercise,
    moveUp,
    moveDown,
    updateDefault,
    save,
  }
}
