/**
 * Client-side local storage utilities for caching user data and preferences
 */

export interface StoredUserData {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  lastLogin?: string
  preferences?: Record<string, any>
}

export interface StoredBusinessPlan {
  id: string
  name: string
  ownerId: string
  sections?: Record<string, any>
  lastModified?: string
}

/**
 * Get user data from localStorage
 */
export function getUserFromStorage(): StoredUserData | null {
  if (typeof window === "undefined") return null

  try {
    const userData = localStorage.getItem("impact-charter-user")
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error("Error reading user data from localStorage:", error)
    return null
  }
}

/**
 * Save user data to localStorage
 */
export function saveUserToStorage(userData: StoredUserData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(
      "impact-charter-user",
      JSON.stringify({
        ...userData,
        lastLogin: new Date().toISOString(),
      }),
    )
  } catch (error) {
    console.error("Error saving user data to localStorage:", error)
  }
}

/**
 * Remove user data from localStorage
 */
export function removeUserFromStorage(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("impact-charter-user")
  } catch (error) {
    console.error("Error removing user data from localStorage:", error)
  }
}

/**
 * Get cached business plans from localStorage
 */
export function getBusinessPlansFromStorage(userId: string): StoredBusinessPlan[] {
  if (typeof window === "undefined") return []

  try {
    const plansData = localStorage.getItem(`impact-charter-plans-${userId}`)
    return plansData ? JSON.parse(plansData) : []
  } catch (error) {
    console.error("Error reading business plans from localStorage:", error)
    return []
  }
}

/**
 * Save business plans to localStorage
 */
export function saveBusinessPlansToStorage(userId: string, plans: StoredBusinessPlan[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(`impact-charter-plans-${userId}`, JSON.stringify(plans))
  } catch (error) {
    console.error("Error saving business plans to localStorage:", error)
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): Record<string, any> {
  if (typeof window === "undefined") return {}

  try {
    const preferences = localStorage.getItem("impact-charter-preferences")
    return preferences ? JSON.parse(preferences) : {}
  } catch (error) {
    console.error("Error reading preferences from localStorage:", error)
    return {}
  }
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences(preferences: Record<string, any>): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("impact-charter-preferences", JSON.stringify(preferences))
  } catch (error) {
    console.error("Error saving preferences to localStorage:", error)
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorageData(): void {
  if (typeof window === "undefined") return

  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("impact-charter-")) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error clearing storage data:", error)
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { used: number; available: number } {
  if (typeof window === "undefined") return { used: 0, available: 0 }

  try {
    let used = 0
    const keys = Object.keys(localStorage)

    keys.forEach((key) => {
      if (key.startsWith("impact-charter-")) {
        used += localStorage.getItem(key)?.length || 0
      }
    })

    // Rough estimate of available space (most browsers allow ~5-10MB)
    const available = 5 * 1024 * 1024 - used // 5MB estimate

    return { used, available }
  } catch (error) {
    console.error("Error getting storage info:", error)
    return { used: 0, available: 0 }
  }
}
