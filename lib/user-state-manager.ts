import type { User } from "@/lib/user-types"

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

export interface UserSession {
  id: string
  userId: string
  createdAt: string
  expiresAt: string
  lastActivity: string
  isActive: boolean
}

export interface UserState {
  user: User | null
  preferences: UserPreferences
  session: UserSession | null
  isAuthenticated: boolean
  isLoading: boolean
}

type StateChangeListener = (state: UserState) => void

class UserStateManager {
  private static instance: UserStateManager
  private state: UserState
  private listeners: Set<StateChangeListener> = new Set()
  private storageKey = "user-state"
  private sessionCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.state = {
      user: null,
      preferences: {
        theme: "system",
        notifications: true,
        autoSave: true,
        collaborationMode: "real-time",
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sidebarCollapsed: false,
        defaultPlanView: "grid",
      },
      session: null,
      isAuthenticated: false,
      isLoading: true,
    }

    this.initializeState()
    this.startSessionCheck()
    this.setupStorageListener()
  }

  static getInstance(): UserStateManager {
    if (!UserStateManager.instance) {
      UserStateManager.instance = new UserStateManager()
    }
    return UserStateManager.instance
  }

  private initializeState() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsedState = JSON.parse(stored)

        // Validate session
        if (parsedState.session && this.isSessionValid(parsedState.session)) {
          this.state = {
            ...this.state,
            ...parsedState,
            isLoading: false,
            isAuthenticated: true,
          }
        } else {
          // Session expired, clear it
          this.clearSession()
        }
      } else {
        this.state.isLoading = false
      }
    } catch (error) {
      console.error("Failed to initialize user state:", error)
      this.state.isLoading = false
    }

    this.notifyListeners()
  }

  private isSessionValid(session: UserSession): boolean {
    return new Date(session.expiresAt) > new Date() && session.isActive
  }

  private createSession(userId: string): UserSession {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    return {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
      isActive: true,
    }
  }

  private saveState() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          user: this.state.user,
          preferences: this.state.preferences,
          session: this.state.session,
        }),
      )
    } catch (error) {
      console.error("Failed to save user state:", error)
    }
  }

  private clearSession() {
    this.state = {
      ...this.state,
      user: null,
      session: null,
      isAuthenticated: false,
    }
    this.saveState()
  }

  private startSessionCheck() {
    this.sessionCheckInterval = setInterval(() => {
      if (this.state.session && !this.isSessionValid(this.state.session)) {
        this.logout()
      }
    }, 60000) // Check every minute
  }

  private setupStorageListener() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            const newState = JSON.parse(e.newValue)
            this.state = {
              ...this.state,
              ...newState,
              isAuthenticated: newState.session && this.isSessionValid(newState.session),
            }
            this.notifyListeners()
          } catch (error) {
            console.error("Failed to sync state from storage:", error)
          }
        }
      })
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  login(user: User) {
    const session = this.createSession(user.id)
    this.state = {
      ...this.state,
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
    }
    this.saveState()
    this.notifyListeners()
  }

  logout() {
    this.clearSession()
    this.notifyListeners()
  }

  updateUser(updates: Partial<User>) {
    if (this.state.user) {
      this.state = {
        ...this.state,
        user: { ...this.state.user, ...updates },
      }
      this.saveState()
      this.notifyListeners()
    }
  }

  updatePreferences(updates: Partial<UserPreferences>) {
    this.state = {
      ...this.state,
      preferences: { ...this.state.preferences, ...updates },
    }
    this.saveState()
    this.notifyListeners()
  }

  extendSession() {
    if (this.state.session && this.isSessionValid(this.state.session)) {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Extend by 24 hours

      this.state = {
        ...this.state,
        session: {
          ...this.state.session,
          lastActivity: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      }
      this.saveState()
      this.notifyListeners()
    }
  }

  getSessionInfo() {
    if (!this.state.session) {
      return {
        isActive: false,
        timeRemaining: 0,
        lastActivity: null,
      }
    }

    const now = new Date()
    const expiresAt = new Date(this.state.session.expiresAt)
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime())

    return {
      isActive: this.state.session.isActive && timeRemaining > 0,
      timeRemaining,
      lastActivity: this.state.session.lastActivity,
    }
  }

  getState(): UserState {
    return { ...this.state }
  }

  destroy() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }
  }
}

export default UserStateManager
