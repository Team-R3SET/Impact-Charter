"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getDemoUsers, getUserById, type User } from "@/lib/user-management"
import { userStateManager } from "@/lib/user-state-manager"
import { getUserSettings, saveUserSettings, type UserSettings } from "@/lib/user-settings"

interface UserContextType {
  currentUser: User | null
  users: User[]
  isLoading: boolean
  error: string | null
  isAdmin: boolean
  userSettings: UserSettings | null
  login: (user: User) => Promise<void>
  logout: () => void
  switchUser: (userId: string) => Promise<void>
  updateUserSettings: (settings: Partial<Omit<UserSettings, "userEmail">>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

/**
 * UserProvider – wraps the entire app (see app/layout.tsx)
 * and exposes user data + settings through React context.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  // -----------------------------------------------------------
  // state
  // -----------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const { toast } = useToast()

  const isAdmin =
    currentUser?.role?.toLowerCase().trim() === "admin" || currentUser?.role?.toLowerCase().trim() === "administrator"

  // -----------------------------------------------------------
  // helpers
  // -----------------------------------------------------------
  const fetchSettings = useCallback((email: string) => {
    const settings = getUserSettings(email)
    setUserSettings(settings)
  }, [])

  // -----------------------------------------------------------
  // init
  // -----------------------------------------------------------
  useEffect(() => {
    const init = () => {
      try {
        const demoUsers = getDemoUsers()
        setUsers(demoUsers)

        const lastUserId = userStateManager.getLastUserId()
        const initialUser = lastUserId ? getUserById(lastUserId) : demoUsers[0]

        if (!initialUser) {
          setError("User not found.")
          return
        }

        setCurrentUser(initialUser)
        fetchSettings(initialUser.email)
      } catch (err) {
        console.error(err)
        setError("Failed to initialize user.")
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [fetchSettings])

  // -----------------------------------------------------------
  // auth actions
  // -----------------------------------------------------------
  const login = useCallback(
    async (user: User) => {
      setIsLoading(true)
      userStateManager.login(user)
      setCurrentUser(user)
      userStateManager.setLastUserId(user.id)
      fetchSettings(user.email)
      setIsLoading(false)
    },
    [fetchSettings],
  )

  const logout = useCallback(() => {
    userStateManager.logout()
    setCurrentUser(null)
    setUserSettings(null)
  }, [])

  const switchUser = useCallback(
    async (userId: string) => {
      if (currentUser?.id === userId) return
      setIsLoading(true)

      const newUser = users.find((u) => u.id === userId)
      if (!newUser) {
        toast({
          title: "Error",
          description: "Could not switch user.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      setCurrentUser(newUser)
      userStateManager.setLastUserId(userId)
      fetchSettings(newUser.email)
      toast({
        title: "Switched User",
        description: `You are now logged in as ${newUser.name}.`,
      })
      setIsLoading(false)
    },
    [users, currentUser, fetchSettings, toast],
  )

  // -----------------------------------------------------------
  // settings actions
  // -----------------------------------------------------------
  const updateUserSettings = useCallback(
    (partial: Partial<Omit<UserSettings, "userEmail">>) => {
      if (!currentUser) {
        toast({
          title: "Error",
          description: "No user logged in.",
          variant: "destructive",
        })
        return
      }

      const merged: UserSettings = {
        ...getUserSettings(currentUser.email),
        ...partial,
        userEmail: currentUser.email,
      }

      const saved = saveUserSettings(merged)
      setUserSettings(saved)

      toast({ title: "Settings Saved", description: "Your settings are updated." })
    },
    [currentUser, toast],
  )

  // -----------------------------------------------------------
  // provider value
  // -----------------------------------------------------------
  const value: UserContextType = {
    currentUser,
    users,
    isLoading,
    error,
    isAdmin,
    userSettings,
    login,
    logout,
    switchUser,
    updateUserSettings,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/**
 * Hook for conveniently accessing the user context.
 *
 * Always call inside a React component or another hook.
 */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
