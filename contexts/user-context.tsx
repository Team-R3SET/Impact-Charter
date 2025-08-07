"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { userStateManager, type UserState } from "@/lib/user-state-manager"
import type { User, UserPreferences } from "@/lib/user-types"

interface UserContextType extends UserState {
  updateUser: (user: User) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  login: (user: User) => void
  logout: () => void
  setUser: (user: User) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(userStateManager.getState())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize state
    const initialState = userStateManager.getState()
    setState(initialState)
    setIsLoading(false)

    // Subscribe to state changes
    const unsubscribe = userStateManager.subscribe((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  const updateUser = useCallback((user: User) => {
    userStateManager.updateUser(user)
  }, [])

  const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
    userStateManager.updatePreferences(preferences)
  }, [])

  const login = useCallback((user: User) => {
    userStateManager.login(user)
  }, [])

  const logout = useCallback(() => {
    userStateManager.logout()
  }, [])

  const setUser = useCallback((user: User) => {
    userStateManager.updateUser(user)
  }, [])

  const contextValue: UserContextType = {
    ...state,
    updateUser,
    updatePreferences,
    login,
    logout,
    setUser,
    isLoading,
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
