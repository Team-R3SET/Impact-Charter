/**
 * Local storage utilities for client-side data persistence
 */

export interface StoredUserData {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  lastLogin?: string
}

export interface StoredPlanData {
  id: string
  name: string
  lastAccessed: string
  sections?: Record<string, any>
}

/**
 * Get user data from localStorage
 */
export function getStoredUserData(): StoredUserData | null {
  if (typeof window === "undefined") return null

  try {
    const data = localStorage.getItem("user-data")
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Error reading user data from localStorage:", error)
    return null
  }
}

/**
 * Store user data in localStorage
 */
export function setStoredUserData(userData: StoredUserData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("user-data", JSON.stringify(userData))
  } catch (error) {
    console.error("Error storing user data in localStorage:", error)
  }
}

/**
 * Clear user data from localStorage
 */
export function clearStoredUserData(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("user-data")
  } catch (error) {
    console.error("Error clearing user data from localStorage:", error)
  }
}

/**
 * Get recently accessed plans from localStorage
 */
export function getRecentPlans(): StoredPlanData[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem("recent-plans")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error reading recent plans from localStorage:", error)
    return []
  }
}

/**
 * Add a plan to recent plans list
 */
export function addToRecentPlans(planData: StoredPlanData): void {
  if (typeof window === "undefined") return

  try {
    const recentPlans = getRecentPlans()
    const filteredPlans = recentPlans.filter((plan) => plan.id !== planData.id)
    const updatedPlans = [planData, ...filteredPlans].slice(0, 10) // Keep only 10 most recent

    localStorage.setItem("recent-plans", JSON.stringify(updatedPlans))
  } catch (error) {
    console.error("Error adding plan to recent plans:", error)
  }
}

/**
 * Clear recent plans from localStorage
 */
export function clearRecentPlans(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("recent-plans")
  } catch (error) {
    console.error("Error clearing recent plans from localStorage:", error)
  }
}
