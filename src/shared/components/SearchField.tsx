import clsx from 'clsx'
import styles from './SearchField.module.scss'

interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchField({ className, type = 'search', ...props }: SearchFieldProps) {
  return <input className={clsx(styles.input, className)} type={type} {...props} />
}
