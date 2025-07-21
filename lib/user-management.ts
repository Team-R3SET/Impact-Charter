import type { User } from "./user-types"

// Demo users for testing role switching
export const getDemoUsers = (): User[] => [
  {
    id: "admin-1",
    name: "Sarah Admin",
    email: "admin@example.com", // Corrected email
    role: "administrator",
    company: "Impact Charter Inc.",
    department: "Administration",
    createdDate: "2024-01-15",
    lastLoginDate: "2024-07-20",
    isActive: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "user-1",
    name: "John Doe", // Corrected name
    email: "john.doe@example.com", // Corrected email
    role: "regular",
    company: "Tech Startup Inc.",
    department: "Product",
    createdDate: "2024-02-01",
    lastLoginDate: "2024-07-19",
    isActive: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "user-2",
    name: "Emily Johnson",
    email: "emily.johnson@enterprise.com",
    role: "regular",
    company: "Enterprise Corp",
    department: "Marketing",
    createdDate: "2024-01-20",
    lastLoginDate: "2024-07-18",
    isActive: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "admin-2",
    name: "Michael Admin",
    email: "michael@impactcharter.com",
    role: "administrator",
    company: "Impact Charter Inc.",
    department: "IT",
    createdDate: "2024-01-10",
    lastLoginDate: "2024-07-20",
    isActive: true,
    avatar: "/placeholder-user.jpg",
  },
]

// Get all users (in a real app, this would be from a database)
export const getAllUsers = (): User[] => {
  return getDemoUsers()
}

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return getDemoUsers().find((user) => user.id === id)
}

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return getDemoUsers().find((user) => user.email === email)
}

// Get users by role
export const getUsersByRole = (role: string): User[] => {
  return getDemoUsers().filter((user) => user.role === role)
}

// Get admin users
export const getAdminUsers = (): User[] => {
  return getDemoUsers().filter((user) => user.role === "administrator")
}

// Get regular users
export const getRegularUsers = (): User[] => {
  return getDemoUsers().filter((user) => user.role === "regular")
}

// User statistics
export const getUserStats = () => {
  const users = getDemoUsers()
  return {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === "administrator").length,
    regular: users.filter((u) => u.role === "regular").length,
  }
}

// Create a new user (demo function)
export const createUser = (userData: Omit<User, "id" | "createdDate">): User => {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdDate: new Date().toISOString().split("T")[0],
  }

  // In a real app, this would save to a database
  console.log("Creating user:", newUser)
  return newUser
}

// Update user (demo function)
export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const user = getUserById(id)
  if (!user) return null

  const updatedUser = { ...user, ...updates }

  // In a real app, this would update the database
  console.log("Updating user:", updatedUser)
  return updatedUser
}

// Delete user (demo function)
export const deleteUser = (id: string): boolean => {
  const user = getUserById(id)
  if (!user) return false

  // In a real app, this would delete from the database
  console.log("Deleting user:", id)
  return true
}

// Bulk operations
export const bulkUpdateUsers = (userIds: string[], updates: Partial<User>): User[] => {
  return userIds.map((id) => updateUser(id, updates)).filter(Boolean) as User[]
}

export const bulkDeleteUsers = (userIds: string[]): boolean => {
  return userIds.every((id) => deleteUser(id))
}

// Search users
export const searchUsers = (query: string): User[] => {
  const users = getDemoUsers()
  const lowercaseQuery = query.toLowerCase()

  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.company?.toLowerCase().includes(lowercaseQuery) ||
      user.department?.toLowerCase().includes(lowercaseQuery),
  )
}
