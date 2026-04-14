import { useState, useEffect } from 'react'
import { APP_VERSION } from '@/shared/lib/version'
import { getRemoteAppVersion } from '@/shared/lib/appConfigRepo'

const POLL_MS = 5 * 60 * 1000 // 5 minutes

function parseVersion(v: string): [number, number, number] {
  const [maj = 0, min = 0, patch = 0] = v.replace(/^v/, '').split('.').map(Number)
  return [maj, min, patch]
}

function isNewer(remote: string, local: string): boolean {
  const [rMaj, rMin, rPatch] = parseVersion(remote)
  const [lMaj, lMin, lPatch] = parseVersion(local)
  if (rMaj !== lMaj) return rMaj > lMaj
  if (rMin !== lMin) return rMin > lMin
  return rPatch > lPatch
}

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    async function check() {
      const remote = await getRemoteAppVersion()
      if (remote && isNewer(remote, APP_VERSION)) setUpdateAvailable(true)
    }

    check()
    const id = setInterval(check, POLL_MS)

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return { updateAvailable }
}
