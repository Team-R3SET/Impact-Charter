/**
 * Very small wrapper around `window.localStorage` so the rest
 * of the codebase can use a typed, promise-based API.
 */

type Primitive = string | number | boolean | null

const isBrowser = typeof window !== "undefined"

export async function setItem<T extends Primitive>(key: string, value: T): Promise<void> {
  if (!isBrowser) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export async function getItem<T extends Primitive>(key: string): Promise<T | null> {
  if (!isBrowser) return null
  const raw = window.localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}

export async function removeItem(key: string): Promise<void> {
  if (!isBrowser) return
  window.localStorage.removeItem(key)
}
