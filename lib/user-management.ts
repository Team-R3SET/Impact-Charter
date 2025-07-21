import type { User } from "@/lib/user-types"

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: "user_1",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "administrator",
    avatar: "/placeholder-user.jpg",
    company: "Acme Corp",
    department: "Engineering",
    isActive: true,
    createdDate: "2024-01-15T10:30:00Z",
    lastLoginDate: "2024-01-20T14:22:00Z",
  },
  {
    id: "user_2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "regular",
    avatar: "/placeholder-user.jpg",
    company: "Tech Solutions",
    department: "Marketing",
    isActive: true,
    createdDate: "2024-01-16T09:15:00Z",
    lastLoginDate: "2024-01-20T11:45:00Z",
  },
  {
    id: "user_3",
    name: "Mike Davis",
    email: "mike.davis@example.com",
    role: "regular",
    avatar: "/placeholder-user.jpg",
    company: "Startup Inc",
    department: "Sales",
    isActive: false,
    createdDate: "2024-01-17T16:20:00Z",
    lastLoginDate: "2024-01-18T13:30:00Z",
  },
  {
    id: "user_4",
    name: "Emily Chen",
    email: "emily.chen@example.com",
    role: "administrator",
    avatar: "/placeholder-user.jpg",
    company: "Global Systems",
    department: "IT",
    isActive: true,
    createdDate: "2024-01-18T08:45:00Z",
    lastLoginDate: "2024-01-20T16:10:00Z",
  },
  {
    id: "user_5",
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "regular",
    avatar: "/placeholder-user.jpg",
    company: "Innovation Labs",
    department: "Research",
    isActive: true,
    createdDate: "2024-01-19T12:00:00Z",
    lastLoginDate: "2024-01-20T09:20:00Z",
  },
]

// --- NEW: expose demo users for components like <RoleSwitcher /> ---
export function getDemoUsers(): User[] {
  // Return a shallow copy so consumers don’t mutate the source array
  return [...mockUsers]
}

export async function getAllUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockUsers]
}

export async function getUserById(id: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockUsers.find((user) => user.id === id) || null
}

export async function createUser(userData: Omit<User, "id" | "createdDate" | "lastLoginDate">): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
  }

  mockUsers.push(newUser)
  return newUser
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const userIndex = mockUsers.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData }
  return mockUsers[userIndex]
}

export async function deleteUser(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const userIndex = mockUsers.findIndex((user) => user.id === id)
  if (userIndex === -1) return false

  mockUsers.splice(userIndex, 1)
  return true
}

export async function resetUserPassword(id: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const user = mockUsers.find((user) => user.id === id)
  if (!user) throw new Error("User not found")

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8)
  return tempPassword
}

export async function bulkUpdateUsers(userIds: string[], action: "activate" | "deactivate"): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  let updatedCount = 0
  const isActive = action === "activate"

  userIds.forEach((id) => {
    const userIndex = mockUsers.findIndex((user) => user.id === id)
    if (userIndex !== -1) {
      mockUsers[userIndex].isActive = isActive
      updatedCount++
    }
  })

  return updatedCount
}

export async function getUserStats() {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const total = mockUsers.length
  const active = mockUsers.filter((user) => user.isActive).length
  const administrators = mockUsers.filter((user) => user.role === "administrator").length
  const regular = mockUsers.filter((user) => user.role === "regular").length

  // Calculate recent logins (last 24 hours)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentLogins = mockUsers.filter(
    (user) => user.lastLoginDate && new Date(user.lastLoginDate) > last24Hours,
  ).length

  return {
    total,
    active,
    administrators,
    regular,
    recentLogins,
  }
}

export function getCurrentUser(): User {
  // Return a demo admin user for the current session
  return {
    id: "current_admin",
    name: "Demo Administrator",
    email: "admin@example.com",
    role: "administrator",
    avatar: "/placeholder-user.jpg",
    company: "Demo Company",
    department: "Administration",
    isActive: true,
    createdDate: "2024-01-01T00:00:00Z",
    lastLoginDate: new Date().toISOString(),
  }
}
