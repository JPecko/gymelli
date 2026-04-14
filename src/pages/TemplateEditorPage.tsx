import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTemplateEditor } from '@/features/templates/hooks/useTemplateEditor'
import { deleteTemplate } from '@/features/templates/templates.api'
import { TemplateExerciseRow } from '@/features/templates/components/TemplateExerciseRow'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import type { Exercise } from '@/features/exercises/exercises.types'
import { Button, Input } from '@/shared/components'
import styles from './TemplateEditorPage.module.scss'

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showPicker, setShowPicker] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
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
  } = useTemplateEditor(id)

  async function handleSave() {
    if (!name.trim() || isSaving) return
    await save()
    navigate('/templates')
  }

  async function handleDelete() {
    if (!id || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteTemplate(id)
      navigate('/templates')
    } catch {
      setIsDeleting(false)
    }
  }

  function handleToggleExercise(exercise: Exercise) {
    const idx = draftExercises.findIndex((e) => e.exercise.id === exercise.id)
    if (idx >= 0) {
      removeExercise(idx)
    } else {
      addExercise(exercise)
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/templates')}>
          ← Back
        </button>
        <h1 className={styles.title}>{id ? 'Edit Template' : 'New Template'}</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className={styles.content}>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day A"
        />

        {draftExercises.length > 0 && (
          <div className={styles.exerciseList}>
            {draftExercises.map((draft, i) => (
              <TemplateExerciseRow
                key={draft.exercise.id}
                draft={draft}
                index={i}
                total={draftExercises.length}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
                onRemove={() => removeExercise(i)}
                onUpdateDefault={(field, value) => updateDefault(i, field, value)}
              />
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          fullWidth
          onClick={() => setShowPicker((v) => !v)}
          className={styles.pickerToggle}
        >
          {showPicker ? '− Hide Exercises' : '+ Add Exercises'}
        </Button>

        {showPicker && (
          <ExercisePicker
            selectedIds={draftExercises.map((e) => e.exercise.id)}
            onToggle={handleToggleExercise}
          />
        )}

        {id && (
          <button className={styles.deleteBtn} onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Template'}
          </button>
        )}
      </div>
    </div>
  )
}
