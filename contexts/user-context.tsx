"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/user-types"
import { getAllUsers } from "@/lib/user-management"

interface UserContextType {
  currentUser: User | null
  isLoading: boolean
  login: (user: User) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  users: User[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users] = useState<User[]>(getAllUsers())

  useEffect(() => {
    // Check for stored user session
    const storedUserId = localStorage.getItem("currentUserId")
    if (storedUserId) {
      const user = users.find((u) => u.id === storedUserId)
      if (user) {
        setCurrentUser(user)
      }
    }
    setIsLoading(false)
  }, [users])

  const login = async (user: User) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCurrentUser(user)
      localStorage.setItem("currentUserId", user.id)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUserId")
  }

  const updateUser = (updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates }
      setCurrentUser(updatedUser)
    }
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        updateUser,
        users,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
