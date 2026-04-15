/** Fetches the deployed app version from /version.json (generated at build time). */
export async function getRemoteAppVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`)
    if (!res.ok) return null
    const data = (await res.json()) as { version: string }
    return data.version ?? null
  } catch {
    return null
  }
}
