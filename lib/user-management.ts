import type { User } from "@/lib/user-types"

// Demo users for development and fallback
const demoUsers: User[] = [
  {
    id: "demo-admin-1",
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    company: "Demo Company",
    bio: "System administrator with full access to all features.",
    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    lastLoginDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    loginCount: 45,
  },
  {
    id: "demo-user-1",
    name: "Demo User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
    role: "USER",
    status: "ACTIVE",
    company: "Startup Inc",
    bio: "Entrepreneur building the next big thing.",
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    lastLoginDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    loginCount: 23,
  },
  {
    id: "demo-user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane@example.com",
    role: "USER",
    status: "ACTIVE",
    company: "Tech Solutions",
    bio: "Product manager focused on user experience.",
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    lastLoginDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    loginCount: 12,
  },
]

// In-memory storage for demo mode
const users: User[] = [...demoUsers]

// Added missing function exports
export const getUserStats = async () => {
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === "ACTIVE").length
  const adminUsers = users.filter(user => user.role === "ADMIN").length
  const recentLogins = users.filter(user => {
    if (!user.lastLoginDate) return false
    const lastLogin = new Date(user.lastLoginDate)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return lastLogin > dayAgo
  }).length

  return {
    totalUsers,
    activeUsers,
    adminUsers,
    recentLogins,
    inactiveUsers: totalUsers - activeUsers
  }
}

export const getCurrentUser = async (email?: string): Promise<User | null> => {
  if (!email) return null
  return users.find(user => user.email === email) || null
}

export const canViewLogs = (user: User | null): boolean => {
  return user?.role === "ADMIN" || false
}

export const getDemoUsers = (): User[] => {
  return [...demoUsers]
}

export const getAllUsers = async (): Promise<User[]> => {
  // Return demo users as fallback
  return [...users]
}

export const getUserById = async (id: string): Promise<User | null> => {
  return users.find((user) => user.id === id) || null
}

export const createUser = async (userData: Omit<User, "id" | "createdDate" | "lastModified">): Promise<User> => {
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    loginCount: 0,
  }

  users.push(newUser)
  return newUser
}

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    lastModified: new Date().toISOString(),
  }

  return users[userIndex]
}

export const deleteUser = async (id: string): Promise<boolean> => {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return false

  users.splice(userIndex, 1)
  return true
}

export const bulkUpdateUsers = async (userIds: string[], updates: Partial<User>): Promise<User[]> => {
  const updatedUsers: User[] = []

  for (const id of userIds) {
    const userIndex = users.findIndex((user) => user.id === id)
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        lastModified: new Date().toISOString(),
      }
      updatedUsers.push(users[userIndex])
    }
  }

  return updatedUsers
}

export const resetUserPassword = async (id: string): Promise<{ tempPassword: string } | null> => {
  const user = users.find((user) => user.id === id)
  if (!user) return null

  const tempPassword = Math.random().toString(36).slice(-8)
  return { tempPassword }
}
