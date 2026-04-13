import clsx from 'clsx'
import styles from './IconButton.module.scss'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  done?: boolean
  size?: 'sm' | 'md'
}

export function IconButton({ done = false, size = 'md', className, children, ...props }: IconButtonProps) {
  return (
    <button
      className={clsx(styles.btn, styles[size], done && styles.done, className)}
      {...props}
    >
      {children}
    </button>
  )
}
