import { useState } from 'react'
import type { ExerciseGoal, TrackingType } from '../exercises.types'
import { Button } from '@/shared/components'
import styles from './GoalForm.module.scss'

interface GoalFormProps {
  goal: ExerciseGoal | null
  tracking: TrackingType
  isSaving: boolean
  onSave: (values: {
    target_weight_kg?: number | null
    target_reps?: number | null
    target_duration_seconds?: number | null
    target_distance_km?: number | null
    note?: string | null
    target_date?: string | null
  }) => Promise<void>
  onCancel: () => void
}

export function GoalForm({ goal, tracking, isSaving, onSave, onCancel }: GoalFormProps) {
  const [weightKg, setWeightKg] = useState(goal?.target_weight_kg?.toString() ?? '')
  const [reps, setReps] = useState(goal?.target_reps?.toString() ?? '')
  const [durationSec, setDurationSec] = useState(goal?.target_duration_seconds?.toString() ?? '')
  const [distanceKm, setDistanceKm] = useState(goal?.target_distance_km?.toString() ?? '')
  const [note, setNote] = useState(goal?.note ?? '')
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? '')

  async function handleSubmit() {
    await onSave({
      target_weight_kg: weightKg ? parseFloat(weightKg) : null,
      target_reps: reps ? parseInt(reps) : null,
      target_duration_seconds: durationSec ? parseInt(durationSec) : null,
      target_distance_km: distanceKm ? parseFloat(distanceKm) : null,
      note: note.trim() || null,
      target_date: targetDate || null,
    })
  }

  return (
    <div className={styles.form}>
      {tracking === 'weight_reps' && (
        <div className={styles.row}>
          <label className={styles.label}>Target weight (kg)</label>
          <input className={styles.input} type="number" inputMode="decimal" value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 100" />
        </div>
      )}
      {(tracking === 'weight_reps' || tracking === 'reps_only') && (
        <div className={styles.row}>
          <label className={styles.label}>Target reps</label>
          <input className={styles.input} type="number" inputMode="numeric" value={reps}
            onChange={(e) => setReps(e.target.value)} placeholder="e.g. 10" />
        </div>
      )}
      {tracking === 'duration' && (
        <div className={styles.row}>
          <label className={styles.label}>Target duration (seconds)</label>
          <input className={styles.input} type="number" inputMode="numeric" value={durationSec}
            onChange={(e) => setDurationSec(e.target.value)} placeholder="e.g. 120" />
        </div>
      )}
      {tracking === 'distance' && (
        <div className={styles.row}>
          <label className={styles.label}>Target distance (km)</label>
          <input className={styles.input} type="number" inputMode="decimal" value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)} placeholder="e.g. 5" />
        </div>
      )}
      <div className={styles.row}>
        <label className={styles.label}>Target date (optional)</label>
        <input className={styles.input} type="date" value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>Note (optional)</label>
        <input className={styles.input} type="text" value={note}
          onChange={(e) => setNote(e.target.value)} placeholder="e.g. Before summer" />
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Goal'}
        </Button>
      </div>
    </div>
  )
}
