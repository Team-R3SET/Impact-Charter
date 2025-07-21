import type { User, UserPreferences } from "@/lib/user-types"

export interface UserState {
  user: User | null
  preferences: UserPreferences
  sessionId: string | null
  sessionExpiry: number | null
  isAuthenticated: boolean
  lastActivity: number
}

export interface StorageData {
  userState: UserState
  version: string
}

class UserStateManager {
  private static instance: UserStateManager
  private storageKey = "user-state"
  private version = "1.0.0"
  private listeners: Array<(state: UserState) => void> = []
  private activityTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
  private warningTime = 5 * 60 * 1000 // 5 minutes before expiry

  private constructor() {
    this.initializeStorageListener()
    this.startActivityTracking()
  }

  public static getInstance(): UserStateManager {
    if (!UserStateManager.instance) {
      UserStateManager.instance = new UserStateManager()
    }
    return UserStateManager.instance
  }

  private initializeStorageListener() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === this.storageKey) {
          const state = this.getState()
          this.notifyListeners(state)
        }
      })
    }
  }

  private startActivityTracking() {
    if (typeof window !== "undefined") {
      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

      const updateActivity = () => {
        const state = this.getState()
        if (state.isAuthenticated) {
          this.updateLastActivity()
        }
      }

      events.forEach((event) => {
        document.addEventListener(event, updateActivity, true)
      })
    }
  }

  private updateLastActivity() {
    const state = this.getState()
    if (state.isAuthenticated) {
      const now = Date.now()
      const updatedState = {
        ...state,
        lastActivity: now,
        sessionExpiry: now + this.sessionDuration,
      }
      this.setState(updatedState)
      this.scheduleSessionWarning(updatedState)
    }
  }

  private scheduleSessionWarning(state: UserState) {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }

    if (state.sessionExpiry) {
      const timeUntilWarning = state.sessionExpiry - Date.now() - this.warningTime

      if (timeUntilWarning > 0) {
        this.warningTimer = setTimeout(() => {
          this.showSessionWarning()
        }, timeUntilWarning)
      }
    }
  }

  private showSessionWarning() {
    if (typeof window !== "undefined") {
      const extend = confirm("Your session will expire in 5 minutes. Would you like to extend it?")
      if (extend) {
        this.updateLastActivity()
      }
    }
  }

  public subscribe(listener: (state: UserState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(state: UserState) {
    this.listeners.forEach((listener) => listener(state))
  }

  public getState(): UserState {
    try {
      if (typeof window === "undefined") {
        return this.getDefaultState()
      }

      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return this.getDefaultState()
      }

      const data: StorageData = JSON.parse(stored)

      // Check version compatibility
      if (data.version !== this.version) {
        this.clearState()
        return this.getDefaultState()
      }

      // Check session expiry
      if (data.userState.sessionExpiry && Date.now() > data.userState.sessionExpiry) {
        this.clearState()
        return this.getDefaultState()
      }

      return data.userState
    } catch (error) {
      console.error("Error reading user state:", error)
      return this.getDefaultState()
    }
  }

  public setState(state: UserState): void {
    try {
      if (typeof window === "undefined") return

      const data: StorageData = {
        userState: state,
        version: this.version,
      }

      localStorage.setItem(this.storageKey, JSON.stringify(data))
      this.notifyListeners(state)

      // Schedule session warning if authenticated
      if (state.isAuthenticated) {
        this.scheduleSessionWarning(state)
      }
    } catch (error) {
      console.error("Error saving user state:", error)
    }
  }

  public updateUser(user: User): void {
    const currentState = this.getState()
    this.setState({
      ...currentState,
      user,
      lastActivity: Date.now(),
    })
  }

  public updatePreferences(preferences: Partial<UserPreferences>): void {
    const currentState = this.getState()
    this.setState({
      ...currentState,
      preferences: {
        ...currentState.preferences,
        ...preferences,
      },
      lastActivity: Date.now(),
    })
  }

  public login(user: User): void {
    const now = Date.now()
    const sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`

    const state: UserState = {
      user,
      preferences: this.getDefaultPreferences(),
      sessionId,
      sessionExpiry: now + this.sessionDuration,
      isAuthenticated: true,
      lastActivity: now,
    }

    this.setState(state)
  }

  public logout(): void {
    this.clearState()
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
  }

  public clearState(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.storageKey)
      }
      this.notifyListeners(this.getDefaultState())
    } catch (error) {
      console.error("Error clearing user state:", error)
    }
  }

  public isSessionValid(): boolean {
    const state = this.getState()
    return state.isAuthenticated && state.sessionExpiry !== null && Date.now() < state.sessionExpiry
  }

  private getDefaultState(): UserState {
    return {
      user: null,
      preferences: this.getDefaultPreferences(),
      sessionId: null,
      sessionExpiry: null,
      isAuthenticated: false,
      lastActivity: Date.now(),
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: "system",
      notifications: true,
      autoSave: true,
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }
}

export const userStateManager = UserStateManager.getInstance()
