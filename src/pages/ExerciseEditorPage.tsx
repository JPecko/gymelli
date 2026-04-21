import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExerciseEditor } from '@/features/exercises/hooks/useExerciseEditor'
import type { TrackingType } from '@/features/exercises/exercises.types'
import { Button, Input } from '@/shared/components'
import styles from './ExerciseEditorPage.module.scss'

const TRACKING_OPTIONS: { value: TrackingType; label: string; hint: string }[] = [
  { value: 'weight_reps', label: 'Weight + Reps', hint: 'e.g. Bench Press' },
  { value: 'reps_only',   label: 'Reps only',    hint: 'e.g. Pull-ups' },
  { value: 'duration',    label: 'Duration',     hint: 'e.g. Plank' },
  { value: 'distance',    label: 'Distance',     hint: 'e.g. Run' },
]

export function ExerciseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    form, setField,
    muscleGroups, equipment,
    imagePreview, existingImageUrl, handleImagePick,
    isLoading, isSaving, error,
    save,
  } = useExerciseEditor(id)

  const isEdit = Boolean(id)
  const canSave = form.name.trim() && form.muscle_group_id && !isSaving

  async function handleSave() {
    if (!canSave) return
    try {
      const savedId = await save()
      navigate(`/exercises/${savedId}`)
    } catch {
      // error shown via `error` state
    }
  }

  if (isLoading) return <div className={styles.loading}>Loading...</div>

  const currentImage = imagePreview ?? existingImageUrl

  return (
    <div className={styles.page}>
      {/* ── Desktop back ─────────────────────────────────────── */}
      <button className={styles.backBtn} onClick={() => navigate(isEdit ? `/exercises/${id}` : '/exercises')}>
        ← {isEdit ? 'Exercise' : 'Exercises'}
      </button>

      <h1 className={styles.title}>{isEdit ? 'Edit Exercise' : 'New Exercise'}</h1>

      {/* ── Image ─────────────────────────────────────────────── */}
      <div className={styles.imageSection}>
        <button className={styles.imageUpload} onClick={() => fileInputRef.current?.click()}>
          {currentImage ? (
            <img src={currentImage} alt="Exercise preview" className={styles.imagePreview} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.imagePlaceholderIcon}>+</span>
              <span className={styles.imagePlaceholderLabel}>Add image</span>
            </div>
          )}
        </button>
        {currentImage && (
          <button className={styles.imageChangeBtn} onClick={() => fileInputRef.current?.click()}>
            Change image
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImagePick(file)
          }}
        />
      </div>

      {/* ── Name ──────────────────────────────────────────────── */}
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => setField('name', e.target.value)}
        placeholder="e.g. Bench Press"
      />

      {/* ── Muscle Group ──────────────────────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>Muscle Group</label>
        <select
          className={styles.select}
          value={form.muscle_group_id}
          onChange={(e) => setField('muscle_group_id', e.target.value)}
        >
          <option value="">Select muscle group…</option>
          {muscleGroups.map((mg) => (
            <option key={mg.id} value={mg.id}>{mg.name}</option>
          ))}
        </select>
      </div>

      {/* ── Equipment ─────────────────────────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>Equipment</label>
        <select
          className={styles.select}
          value={form.equipment_id}
          onChange={(e) => setField('equipment_id', e.target.value)}
        >
          <option value="">Bodyweight (none)</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
      </div>

      {/* ── Tracking type ─────────────────────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>Tracking</label>
        <div className={styles.chipGroup}>
          {TRACKING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={styles.chip}
              data-active={form.tracking_type === opt.value || undefined}
              onClick={() => setField('tracking_type', opt.value)}
            >
              <span className={styles.chipLabel}>{opt.label}</span>
              <span className={styles.chipHint}>{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Type ──────────────────────────────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>Type</label>
        <div className={styles.chipGroup}>
          {(['compound', 'isolation'] as const).map((t) => (
            <button
              key={t}
              className={styles.chip}
              data-active={form.type === t || undefined}
              onClick={() => setField('type', t)}
            >
              <span className={styles.chipLabel} style={{ textTransform: 'capitalize' }}>{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Instructions ──────────────────────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>Instructions <span className={styles.optional}>(optional)</span></label>
        <textarea
          className={styles.textarea}
          value={form.instructions}
          onChange={(e) => setField('instructions', e.target.value)}
          placeholder="Describe form cues, tips, or technique notes…"
          rows={4}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          disabled={!canSave}
        >
          {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Exercise'}
        </Button>
      </footer>
    </div>
  )
}
