/**
 * Mock persistence used when no backend is configured.
 * Stores submissions in this browser only — nothing leaves the device.
 * Storage can be unavailable (private mode, blocked cookies), so every
 * access is guarded and failures are non-fatal.
 */
const PREFIX = 'gh:'

export function appendLocal<T>(collection: string, item: T): void {
  try {
    const key = PREFIX + collection
    const list = JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
    list.push(item)
    localStorage.setItem(key, JSON.stringify(list.slice(-50)))
  } catch {
    /* storage unavailable — ignore in mock mode */
  }
}

export function readLocal<T>(collection: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + collection) ?? '[]') as T[]
  } catch {
    return []
  }
}
