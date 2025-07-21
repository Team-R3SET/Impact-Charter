export interface StorageItem<T = any> {
  value: T
  timestamp: number
  expiresAt?: number
}

export class LocalStorageManager {
  private static instance: LocalStorageManager
  private prefix = "impact_charter_"

  private constructor() {}

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.expiresAt) return false
    return Date.now() > item.expiresAt
  }

  set<T>(key: string, value: T, expirationMinutes?: number): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: expirationMinutes ? Date.now() + expirationMinutes * 60 * 1000 : undefined,
      }

      localStorage.setItem(this.getKey(key), JSON.stringify(item))
      return true
    } catch (error) {
      console.error("Error setting localStorage item:", error)
      return false
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.getKey(key))
      if (!stored) return null

      const item: StorageItem<T> = JSON.parse(stored)

      if (this.isExpired(item)) {
        this.remove(key)
        return null
      }

      return item.value
    } catch (error) {
      console.error("Error getting localStorage item:", error)
      return null
    }
  }

  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.error("Error removing localStorage item:", error)
      return false
    }
  }

  clear(): boolean {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))
      keys.forEach((key) => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error("Error clearing localStorage:", error)
      return false
    }
  }

  exists(key: string): boolean {
    return this.get(key) !== null
  }

  getAll(): Record<string, any> {
    try {
      const result: Record<string, any> = {}
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))

      keys.forEach((key) => {
        const cleanKey = key.replace(this.prefix, "")
        const value = this.get(cleanKey)
        if (value !== null) {
          result[cleanKey] = value
        }
      })

      return result
    } catch (error) {
      console.error("Error getting all localStorage items:", error)
      return {}
    }
  }

  size(): number {
    try {
      return Object.keys(localStorage).filter((key) => key.startsWith(this.prefix)).length
    } catch (error) {
      console.error("Error getting localStorage size:", error)
      return 0
    }
  }
}

// Convenience functions
export const storage = LocalStorageManager.getInstance()

export function setItem<T>(key: string, value: T, expirationMinutes?: number): boolean {
  return storage.set(key, value, expirationMinutes)
}

export function getItem<T>(key: string): T | null {
  return storage.get<T>(key)
}

export function removeItem(key: string): boolean {
  return storage.remove(key)
}

export function clearStorage(): boolean {
  return storage.clear()
}

export function itemExists(key: string): boolean {
  return storage.exists(key)
}

// Business plan specific storage functions
export function saveSectionContent(planId: string, sectionId: string, content: string): boolean {
  return setItem(`section_${planId}_${sectionId}`, {
    content,
    lastModified: new Date().toISOString(),
  })
}

export function getSectionContent(planId: string, sectionId: string): { content: string; lastModified: string } | null {
  return getItem(`section_${planId}_${sectionId}`)
}

export function markSectionComplete(planId: string, sectionId: string, isComplete: boolean): boolean {
  return setItem(`section_${planId}_${sectionId}_completed`, isComplete)
}

export function isSectionComplete(planId: string, sectionId: string): boolean {
  return getItem(`section_${planId}_${sectionId}_completed`) === true
}

export function saveUserPreferences(userId: string, preferences: Record<string, any>): boolean {
  return setItem(`user_preferences_${userId}`, preferences)
}

export function getUserPreferences(userId: string): Record<string, any> | null {
  return getItem(`user_preferences_${userId}`)
}

export function saveRecentPlans(userId: string, planIds: string[]): boolean {
  return setItem(`recent_plans_${userId}`, planIds.slice(0, 10)) // Keep only 10 most recent
}

export function getRecentPlans(userId: string): string[] {
  return getItem(`recent_plans_${userId}`) || []
}

export function addToRecentPlans(userId: string, planId: string): boolean {
  const recent = getRecentPlans(userId)
  const filtered = recent.filter((id) => id !== planId)
  filtered.unshift(planId)
  return saveRecentPlans(userId, filtered)
}
