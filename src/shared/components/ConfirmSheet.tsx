import { Button } from './Button'
import styles from './ConfirmSheet.module.scss'

interface ConfirmSheetProps {
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSheet({
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="ghost" size="lg" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
