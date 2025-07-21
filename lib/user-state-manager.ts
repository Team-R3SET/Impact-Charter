import type { User, UserPreferences } from "./user-types"

export interface UserState {
  user: User | null
  preferences: UserPreferences
}

type UserStateListener = (state: UserState) => void

class UserStateManager {
  private state: UserState
  private listeners: Set<UserStateListener> = new Set()
  private readonly lastUserIdKey = "impact-charter-last-user-id"

  private readonly defaultPreferences: UserPreferences = {
    theme: "system",
    notifications: {
      newLeads: true,
      planUpdates: true,
      mentions: true,
    },
  }

  constructor() {
    this.state = {
      user: null,
      preferences: this.defaultPreferences,
    }
  }

  public subscribe(listener: UserStateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }

  public getState(): UserState {
    return this.state
  }

  public login(user: User): void {
    this.state.user = user
    this.setLastUserId(user.id)
    this.notifyListeners()
  }

  public logout(): void {
    this.state.user = null
    this.state.preferences = this.defaultPreferences
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.lastUserIdKey)
    }
    this.notifyListeners()
  }

  public updateUser(user: User): void {
    if (this.state.user?.id === user.id) {
      this.state.user = user
      this.notifyListeners()
    }
  }

  public updatePreferences(preferences: Partial<UserPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences }
    this.notifyListeners()
  }

  public getLastUserId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.lastUserIdKey)
  }

  public setLastUserId(userId: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.lastUserIdKey, userId)
  }
}

export const userStateManager = new UserStateManager()
