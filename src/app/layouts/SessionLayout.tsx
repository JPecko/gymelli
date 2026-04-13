import { Outlet } from 'react-router-dom'
import styles from './SessionLayout.module.scss'

export function SessionLayout() {
  return (
    <div className={styles.root}>
      <Outlet />
    </div>
  )
}
