import clsx from 'clsx'
import styles from './Input.module.scss'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(styles.input, error && styles.inputError, className)}
        {...props}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
