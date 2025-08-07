// This ensures all API routes use the same Map instance for user settings

/**
 * Shared in-memory store for user settings
 * Used across API routes to ensure consistent access to user data
 */
export const userSettingsStore = new Map<string, any>()

/**
 * Debug function to log the current state of the store
 */
export function debugStore() {
  console.log("Current store keys:", Array.from(userSettingsStore.keys()))
  
  // Log a sanitized version of the store (hiding sensitive data)
  const sanitizedStore = new Map<string, any>()
  userSettingsStore.forEach((value, key) => {
    const sanitizedValue = { ...value }
    if (sanitizedValue.airtablePersonalAccessToken) {
      sanitizedValue.airtablePersonalAccessToken = "••••••••••••••••"
    }
    sanitizedStore.set(key, sanitizedValue)
  })
  
  console.log("Store contents (sanitized):", Object.fromEntries(sanitizedStore))
}
