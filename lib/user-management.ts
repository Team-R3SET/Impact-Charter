import { randomUUID } from "crypto"

// Demo users for development and testing
const DEMO_USERS = [
  {
    id: "demo-admin-1",
    name: "Demo Admin",
    email: "admin@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin@example.com",
    role: "admin" as const,
    status: "active" as const,
    company: "Demo Corp",
    department: "Administration",
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    loginCount: 45,
  },
  {
    id: "demo-user-1",
    name: "Demo User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
    role: "user" as const,
    status: "active" as const,
    company: "Demo Corp",
    department: "Marketing",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    loginCount: 23,
  },
  {
    id: "demo-user-2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah@example.com",
    role: "user" as const,
    status: "active" as const,
    company: "Demo Corp",
    department: "Sales",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    loginCount: 12,
  },
  {
    id: "demo-user-3",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike@example.com",
    role: "user" as const,
    status: "inactive" as const,
    company: "Demo Corp",
    department: "Engineering",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days ago
    loginCount: 8,
  },
]

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "user"
  status: "active" | "inactive"
  company?: string
  department?: string
  lastLogin?: string
  createdAt: string
  loginCount?: number
}

export interface CreateUserData {
  name: string
  email: string
  role: "admin" | "user"
  company?: string
  department?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: "admin" | "user"
  status?: "active" | "inactive"
  company?: string
  department?: string
}

export interface UserFilters {
  search?: string
  role?: "admin" | "user" | "all"
  status?: "active" | "inactive" | "all"
  department?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  users: number
  recentLogins: number
}

// Export demo users for components that need them
export function getDemoUsers(): User[] {
  return DEMO_USERS
}

export async function getUsers(filters?: UserFilters): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let users = [...DEMO_USERS]

  if (filters) {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.company?.toLowerCase().includes(search) ||
          user.department?.toLowerCase().includes(search),
      )
    }

    if (filters.role && filters.role !== "all") {
      users = users.filter((user) => user.role === filters.role)
    }

    if (filters.status && filters.status !== "all") {
      users = users.filter((user) => user.status === filters.status)
    }

    if (filters.department) {
      users = users.filter((user) => user.department === filters.department)
    }
  }

  return users
}

export async function getUserById(id: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return DEMO_USERS.find((user) => user.id === id) || null
}

export async function createUser(userData: CreateUserData): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const newUser: User = {
    id: randomUUID(),
    ...userData,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
    status: "active",
    createdAt: new Date().toISOString(),
    loginCount: 0,
  }

  DEMO_USERS.push(newUser)
  return newUser
}

export async function updateUser(id: string, userData: UpdateUserData): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const userIndex = DEMO_USERS.findIndex((user) => user.id === id)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  DEMO_USERS[userIndex] = {
    ...DEMO_USERS[userIndex],
    ...userData,
  }

  return DEMO_USERS[userIndex]
}

export async function deleteUser(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const userIndex = DEMO_USERS.findIndex((user) => user.id === id)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  DEMO_USERS.splice(userIndex, 1)
}

export async function bulkUpdateUsers(ids: string[], updates: UpdateUserData): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const updatedUsers: User[] = []

  for (const id of ids) {
    const userIndex = DEMO_USERS.findIndex((user) => user.id === id)
    if (userIndex !== -1) {
      DEMO_USERS[userIndex] = {
        ...DEMO_USERS[userIndex],
        ...updates,
      }
      updatedUsers.push(DEMO_USERS[userIndex])
    }
  }

  return updatedUsers
}

export async function resetUserPassword(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = DEMO_USERS.find((user) => user.id === id)
  if (!user) {
    throw new Error("User not found")
  }

  // In a real app, this would send a password reset email
  console.log(`Password reset email sent to ${user.email}`)
}

export async function getUserStats(): Promise<UserStats> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const total = DEMO_USERS.length
  const active = DEMO_USERS.filter((user) => user.status === "active").length
  const inactive = DEMO_USERS.filter((user) => user.status === "inactive").length
  const admins = DEMO_USERS.filter((user) => user.role === "admin").length
  const users = DEMO_USERS.filter((user) => user.role === "user").length

  // Users who logged in within the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentLogins = DEMO_USERS.filter((user) => {
    if (!user.lastLogin) return false
    return new Date(user.lastLogin) > weekAgo
  }).length

  return {
    total,
    active,
    inactive,
    admins,
    users,
    recentLogins,
  }
}

export function getDepartments(): string[] {
  const departments = new Set(DEMO_USERS.map((user) => user.department).filter(Boolean))
  return Array.from(departments) as string[]
}
