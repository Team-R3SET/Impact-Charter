import type { User } from "@/lib/user-types"

// Demo users for role switching
export function getDemoUsers(): User[] {
  return [
    {
      id: "admin-1",
      name: "Demo Admin",
      email: "admin@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin@example.com",
      role: "administrator",
      company: "System Administration",
      department: "IT",
      createdDate: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "user-1",
      name: "John Doe",
      email: "john@startup.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john@startup.com",
      role: "regular",
      company: "Startup Inc",
      department: "Business Development",
      createdDate: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@innovation.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane@innovation.com",
      role: "regular",
      company: "Innovation Corp",
      department: "Strategy",
      createdDate: new Date().toISOString(),
      isActive: true,
    },
  ]
}

// ---- new code ----
let users: User[] = getDemoUsers()
// ------------------

// Role checking functions
export function isAdministrator(user: User): boolean {
  return user.role === "administrator"
}

export function canAccessAdminFeatures(user: User): boolean {
  return isAdministrator(user)
}

export function canViewLogs(user: User): boolean {
  return isAdministrator(user)
}

export function canManageUsers(user: User): boolean {
  return isAdministrator(user)
}

export async function getCurrentUser(email: string): Promise<User | null> {
  const user = users.find((u) => u.email === email && u.isActive)
  if (user) {
    user.lastLoginDate = new Date().toISOString()
  }
  return user || null
}

export async function deactivateUser(userId: string): Promise<boolean> {
  const idx = users.findIndex((u) => u.id === userId)
  if (idx !== -1) {
    users[idx].isActive = false
    return true
  }
  return false
}

export async function getUserStats(): Promise<{
  total: number
  active: number
  administrators: number
  regular: number
  recentLogins: number
}> {
  const total = users.length
  const active = users.filter((u) => u.isActive).length
  const administrators = users.filter((u) => u.role === "administrator" && u.isActive).length
  const regular = users.filter((u) => u.role === "regular" && u.isActive).length
  const recentLogins = users.filter(
    (u) => u.lastLoginDate && new Date(u.lastLoginDate) > new Date(Date.now() - 24 * 60 * 60 * 1000),
  ).length

  return { total, active, administrators, regular, recentLogins }
}

// User CRUD operations (demo implementation)
export async function createUser(userData: Omit<User, "id" | "createdDate">): Promise<User> {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdDate: new Date().toISOString(),
  }

  users.push(newUser)

  // In a real app, this would save to a database
  console.log("Creating user:", newUser)
  return newUser
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  // In a real app, this would update the database
  console.log("Updating user:", userId, updates)

  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates }
    return users[userIndex]
  }

  return null
}

export async function deleteUser(userId: string): Promise<boolean> {
  // In a real app, this would delete from the database
  console.log("Deleting user:", userId)
  users = users.filter((user) => user.id !== userId)
  return true
}

export async function getAllUsers(): Promise<User[]> {
  // In a real app, this would fetch from the database
  return users
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = users.find((user) => user.id === userId)
  return user || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = users.find((user) => user.email === email)
  return user || null
}
