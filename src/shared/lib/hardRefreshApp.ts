/** Unregisters service workers, clears caches, and forces a full page reload. */
export async function hardRefreshApp(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((r) => r.unregister()))
  }

  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  }

  const { origin, pathname } = window.location
  window.location.href = `${origin}${pathname}?refresh=${Date.now()}`
}
