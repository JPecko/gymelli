import { useState, useEffect } from 'react'
import {
  getExerciseById,
  getMuscleGroups,
  getEquipment,
  createExercise,
  updateExercise,
  uploadExerciseImage,
} from '../exercises.api'
import type { MuscleGroup, Equipment, TrackingType } from '../exercises.types'

interface FormState {
  name: string
  muscle_group_id: string
  equipment_id: string
  type: 'compound' | 'isolation'
  tracking_type: TrackingType
  instructions: string
}

const EMPTY_FORM: FormState = {
  name: '',
  muscle_group_id: '',
  equipment_id: '',
  type: 'compound',
  tracking_type: 'weight_reps',
  instructions: '',
}

export function useExerciseEditor(exerciseId?: string) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [muscleGroupsData, equipmentData] = await Promise.all([
        getMuscleGroups(),
        getEquipment(),
        exerciseId
          ? getExerciseById(exerciseId).then((ex) => {
              setForm({
                name: ex.name,
                muscle_group_id: ex.muscle_group_id,
                equipment_id: ex.equipment_id ?? '',
                type: ex.type,
                tracking_type: ex.tracking_type,
                instructions: ex.instructions ?? '',
              })
              setExistingImageUrl(ex.image_url)
            })
          : Promise.resolve(),
      ])
      setMuscleGroups(muscleGroupsData)
      setEquipment(equipmentData)
      setIsLoading(false)
    }
    load()
  }, [exerciseId])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleImagePick(file: File) {
    setPendingImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function save(): Promise<string> {
    setIsSaving(true)
    setError(null)
    try {
      let image_url = existingImageUrl ?? undefined

      if (pendingImage) {
        image_url = await uploadExerciseImage(pendingImage)
      }

      const payload = {
        name: form.name.trim(),
        muscle_group_id: form.muscle_group_id,
        equipment_id: form.equipment_id || null,
        type: form.type,
        tracking_type: form.tracking_type,
        instructions: form.instructions.trim() || null,
        image_url: image_url ?? null,
      }

      if (exerciseId) {
        await updateExercise(exerciseId, payload)
        return exerciseId
      } else {
        const created = await createExercise(payload)
        return created.id
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return {
    form, setField,
    muscleGroups, equipment,
    pendingImage, imagePreview, existingImageUrl, handleImagePick,
    isLoading, isSaving, error,
    save,
  }
}
