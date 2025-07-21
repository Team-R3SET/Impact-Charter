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

// User CRUD operations (demo implementation)
export async function createUser(userData: Omit<User, "id" | "createdDate">): Promise<User> {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdDate: new Date().toISOString(),
  }

  // In a real app, this would save to a database
  console.log("Creating user:", newUser)
  return newUser
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  // In a real app, this would update the database
  console.log("Updating user:", userId, updates)

  // Return a mock updated user
  const demoUsers = getDemoUsers()
  const user = demoUsers.find((u) => u.id === userId)
  if (user) {
    return { ...user, ...updates }
  }
  return null
}

export async function deleteUser(userId: string): Promise<boolean> {
  // In a real app, this would delete from the database
  console.log("Deleting user:", userId)
  return true
}

export async function getAllUsers(): Promise<User[]> {
  // In a real app, this would fetch from the database
  return getDemoUsers()
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = getDemoUsers()
  return users.find((user) => user.id === userId) || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = getDemoUsers()
  return users.find((user) => user.email === email) || null
}
