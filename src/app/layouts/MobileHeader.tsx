import { NavLink, useNavigate } from 'react-router-dom'
import { APP_VERSION } from '@/shared/lib/version'
import { BackIcon, ProfileIcon } from './NavIcons'
import type { MobileHeaderConfig } from './mobileHeader.config'
import styles from './MobileHeader.module.scss'

interface MobileHeaderProps {
  config?: MobileHeaderConfig
}

export function MobileHeader({ config }: MobileHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (config?.backTo) {
      navigate(config.backTo)
      return
    }
    navigate(-1)
  }

  return (
    <header className={styles.header}>
      <div className={styles.safeArea} aria-hidden="true" />

      {config ? (
        <div className={styles.bar}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleBack}
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className={styles.title}>{config.title}</h1>

          {config.hideProfile ? (
            <div className={styles.spacer} aria-hidden="true" />
          ) : (
            <NavLink to="/profile" className={styles.iconButton} aria-label="Profile">
              <ProfileIcon />
            </NavLink>
          )}
        </div>
      ) : (
        <div className={styles.brandBar}>
          <div className={styles.wordmarkWrap}>
            <img src="/gymelli-gold-stacked-wormark.svg" alt="Gymelli" className={styles.wordmark} />
            <span className={styles.version}>v{APP_VERSION}</span>
          </div>
          <NavLink to="/profile" className={styles.iconButton} aria-label="Profile">
            <ProfileIcon />
          </NavLink>
        </div>
      )}
    </header>
  )
}
