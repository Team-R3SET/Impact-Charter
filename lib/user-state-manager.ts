import type { User } from "@/lib/user-types"

// Storage keys
const STORAGE_KEYS = {
  USER: "business_plan_user",
  PREFERENCES: "business_plan_preferences",
  SESSION: "business_plan_session",
  THEME: "business_plan_theme",
  LAST_ACTIVITY: "business_plan_last_activity",
} as const

// User preferences interface
export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: boolean
  autoSave: boolean
  collaborationMode: "real-time" | "manual"
  language: string
  timezone: string
  sidebarCollapsed: boolean
  defaultPlanView: "grid" | "list"
}

// Session data interface
export interface SessionData {
  sessionId: string
  loginTime: string
  lastActivity: string
  expiresAt: string
  isActive: boolean
}

// User state interface
export interface UserState {
  user: User | null
  preferences: UserPreferences
  session: SessionData | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  notifications: true,
  autoSave: true,
  collaborationMode: "real-time",
  language: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  sidebarCollapsed: false,
  defaultPlanView: "grid",
}

// Session duration (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000

class UserStateManager {
  private static instance: UserStateManager
  private listeners: Set<(state: UserState) => void> = new Set()
  private currentState: UserState = {
    user: null,
    preferences: DEFAULT_PREFERENCES,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  }

  private constructor() {
    this.initializeState()
    this.setupStorageListener()
    this.setupActivityTracking()
  }

  static getInstance(): UserStateManager {
    if (!UserStateManager.instance) {
      UserStateManager.instance = new UserStateManager()
    }
    return UserStateManager.instance
  }

  // Initialize state from storage
  private initializeState(): void {
    try {
      // Load user data
      const storedUser = this.getFromStorage(STORAGE_KEYS.USER)
      if (storedUser) {
        this.currentState.user = JSON.parse(storedUser)
      }

      // Load preferences
      const storedPreferences = this.getFromStorage(STORAGE_KEYS.PREFERENCES)
      if (storedPreferences) {
        this.currentState.preferences = {
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(storedPreferences),
        }
      }

      // Load session
      const storedSession = this.getFromStorage(STORAGE_KEYS.SESSION)
      if (storedSession) {
        const session = JSON.parse(storedSession)
        if (this.isSessionValid(session)) {
          this.currentState.session = session
          this.currentState.isAuthenticated = true
        } else {
          this.clearSession()
        }
      }

      this.currentState.isLoading = false
      this.notifyListeners()
    } catch (error) {
      console.error("Error initializing user state:", error)
      this.currentState.isLoading = false
      this.notifyListeners()
    }
  }

  // Setup storage event listener for cross-tab synchronization
  private setupStorageListener(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (Object.values(STORAGE_KEYS).includes(event.key as any)) {
          this.initializeState()
        }
      })
    }
  }

  // Setup activity tracking
  private setupActivityTracking(): void {
    if (typeof window !== "undefined") {
      const updateActivity = () => {
        if (this.currentState.session) {
          this.updateLastActivity()
        }
      }

      // Track user activity
      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
      events.forEach((event) => {
        document.addEventListener(event, updateActivity, { passive: true })
      })

      // Check session validity periodically
      setInterval(() => {
        if (this.currentState.session && !this.isSessionValid(this.currentState.session)) {
          this.logout()
        }
      }, 60000) // Check every minute
    }
  }

  // Storage helpers
  private getFromStorage(key: string): string | null {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  private setToStorage(key: string, value: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error("Error saving to storage:", error)
    }
  }

  private removeFromStorage(key: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from storage:", error)
    }
  }

  // Session validation
  private isSessionValid(session: SessionData): boolean {
    const now = new Date().getTime()
    const expiresAt = new Date(session.expiresAt).getTime()
    return now < expiresAt && session.isActive
  }

  // Create new session
  private createSession(): SessionData {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + SESSION_DURATION)

    return {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      loginTime: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    }
  }

  // Update last activity
  private updateLastActivity(): void {
    if (this.currentState.session) {
      const updatedSession = {
        ...this.currentState.session,
        lastActivity: new Date().toISOString(),
      }
      this.currentState.session = updatedSession
      this.setToStorage(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession))
      this.setToStorage(STORAGE_KEYS.LAST_ACTIVITY, updatedSession.lastActivity)
    }
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.currentState })
      } catch (error) {
        console.error("Error in state listener:", error)
      }
    })
  }

  // Public methods
  subscribe(listener: (state: UserState) => void): () => void {
    this.listeners.add(listener)
    // Immediately call with current state
    listener({ ...this.currentState })

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): UserState {
    return { ...this.currentState }
  }

  login(user: User): void {
    const session = this.createSession()

    this.currentState.user = user
    this.currentState.session = session
    this.currentState.isAuthenticated = true

    // Persist to storage
    this.setToStorage(STORAGE_KEYS.USER, JSON.stringify(user))
    this.setToStorage(STORAGE_KEYS.SESSION, JSON.stringify(session))

    this.notifyListeners()
  }

  logout(): void {
    this.currentState.user = null
    this.currentState.session = null
    this.currentState.isAuthenticated = false

    // Clear storage
    this.removeFromStorage(STORAGE_KEYS.USER)
    this.removeFromStorage(STORAGE_KEYS.SESSION)
    this.removeFromStorage(STORAGE_KEYS.LAST_ACTIVITY)

    this.notifyListeners()
  }

  updateUser(updates: Partial<User>): void {
    if (this.currentState.user) {
      const updatedUser = { ...this.currentState.user, ...updates }
      this.currentState.user = updatedUser
      this.setToStorage(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      this.notifyListeners()
    }
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    const updatedPreferences = { ...this.currentState.preferences, ...updates }
    this.currentState.preferences = updatedPreferences
    this.setToStorage(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPreferences))
    this.notifyListeners()
  }

  clearSession(): void {
    this.currentState.session = null
    this.currentState.isAuthenticated = false
    this.removeFromStorage(STORAGE_KEYS.SESSION)
    this.removeFromStorage(STORAGE_KEYS.LAST_ACTIVITY)
    this.notifyListeners()
  }

  extendSession(): void {
    if (this.currentState.session) {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + SESSION_DURATION)

      const updatedSession = {
        ...this.currentState.session,
        expiresAt: expiresAt.toISOString(),
        lastActivity: now.toISOString(),
      }

      this.currentState.session = updatedSession
      this.setToStorage(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession))
      this.notifyListeners()
    }
  }

  // Get session info
  getSessionInfo(): {
    isActive: boolean
    timeRemaining: number
    lastActivity: string | null
  } {
    if (!this.currentState.session) {
      return {
        isActive: false,
        timeRemaining: 0,
        lastActivity: null,
      }
    }

    const now = new Date().getTime()
    const expiresAt = new Date(this.currentState.session.expiresAt).getTime()
    const timeRemaining = Math.max(0, expiresAt - now)

    return {
      isActive: this.isSessionValid(this.currentState.session),
      timeRemaining,
      lastActivity: this.currentState.session.lastActivity,
    }
  }
}

export default UserStateManager
