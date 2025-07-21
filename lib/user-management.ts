import type { User, UserRole } from "./user-types"

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date("2024-01-20"),
    preferences: {
      theme: "light",
      notifications: true,
      autoSave: true,
    },
  },
  {
    id: "user-1",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    lastLoginAt: new Date("2024-01-19"),
    preferences: {
      theme: "dark",
      notifications: false,
      autoSave: true,
    },
  },
  {
    id: "user-2",
    email: "jane@example.com",
    name: "Jane Smith",
    role: "user",
    isActive: true,
    createdAt: new Date("2024-01-10"),
    lastLoginAt: new Date("2024-01-18"),
    preferences: {
      theme: "light",
      notifications: true,
      autoSave: false,
    },
  },
]

// Current user state (in a real app, this would come from your auth system)
let currentUserId = "admin-1"

export function getCurrentUser(email?: string): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email) {
        const user = DEMO_USERS.find((u) => u.email === email)
        resolve(user || null)
      } else {
        const user = DEMO_USERS.find((u) => u.id === currentUserId)
        resolve(user || null)
      }
    }, 100)
  })
}

export function switchUser(userId: string): void {
  const user = DEMO_USERS.find((u) => u.id === userId)
  if (user) {
    currentUserId = userId
  }
}

export function getAllUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...DEMO_USERS])
    }, 200)
  })
}

export function canAccessAdminFeatures(user: User): boolean {
  return user.role === "admin" && user.isActive
}

export function canEditPlans(user: User): boolean {
  return user.isActive && (user.role === "admin" || user.role === "user")
}

export function canViewAnalytics(user: User): boolean {
  return user.role === "admin" && user.isActive
}

export function deactivateUser(userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = DEMO_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        DEMO_USERS[userIndex].isActive = false
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}

export function activateUser(userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = DEMO_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        DEMO_USERS[userIndex].isActive = true
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}

export function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = DEMO_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        DEMO_USERS[userIndex].role = role
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}

export function getUserStats(): Promise<{
  totalUsers: number
  activeUsers: number
  adminUsers: number
  recentLogins: number
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalUsers = DEMO_USERS.length
      const activeUsers = DEMO_USERS.filter((u) => u.isActive).length
      const adminUsers = DEMO_USERS.filter((u) => u.role === "admin").length
      const recentLogins = DEMO_USERS.filter((u) => {
        const dayAgo = new Date()
        dayAgo.setDate(dayAgo.getDate() - 1)
        return u.lastLoginAt && u.lastLoginAt > dayAgo
      }).length

      resolve({
        totalUsers,
        activeUsers,
        adminUsers,
        recentLogins,
      })
    }, 250)
  })
}

export function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date(),
      }
      DEMO_USERS.push(newUser)
      resolve(newUser)
    }, 400)
  })
}

export function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = DEMO_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        DEMO_USERS[userIndex] = { ...DEMO_USERS[userIndex], ...updates }
        resolve(DEMO_USERS[userIndex])
      } else {
        resolve(null)
      }
    }, 300)
  })
}
