"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import UserStateManager from "@/lib/user-state-manager"
import type { User } from "@/lib/user-types"
import type { UserState, UserPreferences } from "@/lib/user-state-manager"

interface UserContextType extends UserState {
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  extendSession: () => void
  getSessionInfo: () => {
    isActive: boolean
    timeRemaining: number
    lastActivity: string | null
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, setState] = useState<UserState>({
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
  })

  useEffect(() => {
    const stateManager = UserStateManager.getInstance()

    // Subscribe to state changes
    const unsubscribe = stateManager.subscribe((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  const contextValue: UserContextType = {
    ...state,
    login: (user: User) => {
      UserStateManager.getInstance().login(user)
    },
    logout: () => {
      UserStateManager.getInstance().logout()
    },
    updateUser: (updates: Partial<User>) => {
      UserStateManager.getInstance().updateUser(updates)
    },
    updatePreferences: (updates: Partial<UserPreferences>) => {
      UserStateManager.getInstance().updatePreferences(updates)
    },
    extendSession: () => {
      UserStateManager.getInstance().extendSession()
    },
    getSessionInfo: () => {
      return UserStateManager.getInstance().getSessionInfo()
    },
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export function useUser(): UserContextType {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// Hook for authentication status
export function useAuth() {
  const { isAuthenticated, isLoading, user, login, logout } = useUser()
  return { isAuthenticated, isLoading, user, login, logout }
}

// Hook for user preferences
export function useUserPreferences() {
  const { preferences, updatePreferences } = useUser()
  return { preferences, updatePreferences }
}

// Hook for session management
export function useSession() {
  const { session, getSessionInfo, extendSession } = useUser()
  return { session, getSessionInfo, extendSession }
}
