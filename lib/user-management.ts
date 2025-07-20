import { randomUUID } from "crypto"
import type { User } from "@/lib/user-types"
import { isAdministrator, canAccessAdminFeatures, canViewLogs, canManageUsers } from "@/lib/user-types"

// Re-export for convenience
export { isAdministrator, canAccessAdminFeatures, canViewLogs, canManageUsers }

const users: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "administrator",
    company: "Business Plan Co",
    department: "IT Administration",
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    isActive: true,
    avatar: "/placeholder.svg?height=40&width=40&text=AD",
  },
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "regular",
    company: "Startup Inc",
    department: "Business Development",
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    isActive: true,
    avatar: "/placeholder.svg?height=40&width=40&text=JD",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "regular",
    company: "Innovation Corp",
    department: "Strategy",
    createdDate: new Date().toISOString(),
    isActive: true,
    avatar: "/placeholder.svg?height=40&width=40&text=JS",
  },
]

export const getCurrentUser = async (email: string): Promise<User | null> => {
  const user = users.find((u) => u.email === email && u.isActive)
  if (user && user.email === email) {
    user.lastLoginDate = new Date().toISOString()
  }
  return user || null
}

export const getAllUsers = async (): Promise<User[]> => {
  return users.filter((u) => u.isActive)
}

export const createUser = async (userData: Omit<User, "id" | "createdDate">): Promise<User> => {
  const newUser: User = {
    ...userData,
    id: randomUUID(),
    createdDate: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates }
    return users[userIndex]
  }
  return null
}

export const deactivateUser = async (userId: string): Promise<boolean> => {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].isActive = false
    return true
  }
  return false
}

export const getUserStats = async (): Promise<{
  total: number
  active: number
  administrators: number
  regular: number
  recentLogins: number
}> => {
  const total = users.length
  const active = users.filter((u) => u.isActive).length
  const administrators = users.filter((u) => u.role === "administrator" && u.isActive).length
  const regular = users.filter((u) => u.role === "regular" && u.isActive).length
  const recentLogins = users.filter(
    (u) => u.lastLoginDate && new Date(u.lastLoginDate) > new Date(Date.now() - 24 * 60 * 60 * 1000),
  ).length

  return { total, active, administrators, regular, recentLogins }
}
