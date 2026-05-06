import { useState } from 'react'
import { Button } from '@/shared/components'
import styles from './BwFactorBanner.module.scss'

interface BwFactorBannerProps {
  effective_bw_factor: number | null
  body_weight_kg: number | null
  onSaveBodyWeight: (kg: number) => Promise<void>
}

const DEFAULT_FACTOR = 0.6

export function BwFactorBanner({ effective_bw_factor, body_weight_kg, onSaveBodyWeight }: BwFactorBannerProps) {
  const [localWeight, setLocalWeight] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const factor = effective_bw_factor ?? DEFAULT_FACTOR
  const isDefault = effective_bw_factor === null
  const effectiveKg = body_weight_kg != null
    ? Math.round(body_weight_kg * factor * 10) / 10
    : null

  async function handleSave() {
    const kg = parseFloat(localWeight)
    if (isNaN(kg) || kg <= 0) return
    setIsSaving(true)
    try {
      await onSaveBodyWeight(kg)
    } finally {
      setIsSaving(false)
    }
  }

  if (body_weight_kg != null) {
    return (
      <div className={styles.banner}>
        <span className={styles.effectiveKg}>~{effectiveKg} kg</span>
        <span className={styles.desc}>
          effective weight · {Math.round(factor * 100)}% body weight
          {isDefault && <span className={styles.hint}> · adjust in exercise settings</span>}
        </span>
      </div>
    )
  }

  return (
    <div className={styles.banner} data-warn>
      <p className={styles.warnText}>Add body weight to estimate volume for this exercise</p>
      <div className={styles.inlineInput}>
        <input
          className={styles.weightInput}
          type="number"
          inputMode="decimal"
          placeholder="kg"
          value={localWeight}
          onChange={(e) => setLocalWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          disabled={isSaving}
          aria-label="Body weight in kg"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !localWeight.trim()}
        >
          {isSaving ? '…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
