import clsx from 'clsx'
import styles from './StepperInput.module.scss'

interface StepperInputProps {
  value: number | null
  onChange: (value: number | null) => void
  step?: number
  min?: number
  disabled?: boolean
  inputMode?: 'decimal' | 'numeric'
  'aria-label'?: string
}

export function StepperInput({
  value,
  onChange,
  step = 1,
  min = 0,
  disabled = false,
  inputMode = 'decimal',
  'aria-label': ariaLabel,
}: StepperInputProps) {
  function decrement() {
    const next = Math.max(min, (value ?? 0) - step)
    onChange(next)
  }

  function increment() {
    onChange((value ?? 0) + step)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange(null)
      return
    }
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) onChange(parsed)
  }

  if (disabled) {
    return (
      <div className={clsx(styles.stepper, styles.done)}>
        <span className={styles.staticValue}>{value ?? '—'}</span>
      </div>
    )
  }

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.btn}
        onClick={decrement}
        tabIndex={-1}
        aria-label="Decrease"
      >
        −
      </button>

      {/* font-size: 1rem — mandatory 16px minimum to prevent iOS Safari zoom on focus */}
      <input
        type="number"
        className={styles.input}
        value={value ?? ''}
        onChange={handleChange}
        inputMode={inputMode}
        aria-label={ariaLabel}
        min={min}
        step={step}
      />

      <button
        type="button"
        className={styles.btn}
        onClick={increment}
        tabIndex={-1}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}
