import { useVersionCheck } from '@/shared/hooks/useVersionCheck'
import { hardRefreshApp } from '@/shared/lib/hardRefreshApp'
import styles from './UpdateBanner.module.scss'

export function UpdateBanner() {
  const { updateAvailable } = useVersionCheck()
  if (!updateAvailable || import.meta.env.DEV) return null

  return (
    <div className={styles.banner} role="status">
      <span className={styles.message}>Nova versão disponível</span>
      <button className={styles.button} onClick={() => void hardRefreshApp()}>
        Atualizar agora
      </button>
    </div>
  )
}
