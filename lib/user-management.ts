/**
 * Lightweight in-memory demo “database” of users plus
 * helper utilities that other parts of the app import.
 *
 * If you later introduce a real database you can replace the
 * internal implementation while keeping the public API identical.
 */

import type { User, UserRecord } from "./user-types"

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

export const getDemoUsers = (): User[] => [
  {
    id: "admin-1",
    name: "Sarah Admin",
    email: "admin@example.com",
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
    name: "John Doe",
    email: "john.doe@example.com",
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

/* ------------------------------------------------------------------ */
/*  CRUD helpers                                                       */
/* ------------------------------------------------------------------ */

export const getAllUsers = (): User[] => getDemoUsers()

export const getUserById = (id: string): User | undefined => getDemoUsers().find((u) => u.id === id)

export const getUserByEmail = (email: string): User | undefined => getDemoUsers().find((u) => u.email === email)

export const createUser = (user: Omit<User, "id" | "createdDate">): User => {
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdDate: new Date().toISOString().split("T")[0],
  }
  console.log("(demo) createUser", newUser)
  return newUser
}

/**
 * Update a single user. (Stub for now – replace with real implementation.)
 */
export async function updateUser(userId: string, partial: Partial<UserRecord>): Promise<{ success: boolean }> {
  // TODO: implement with real data source
  console.log(`Updating user ${userId}`, partial)
  return { success: true }
}

/**
 * Bulk-update many users at once.
 *
 * This satisfies the required named export `bulkUpdateUsers` that was
 * missing during the last deployment.
 */
export async function bulkUpdateUsersAsync(
  updates: { userId: string; data: Partial<UserRecord> }[],
): Promise<{ success: boolean }[]> {
  const results = await Promise.all(updates.map(({ userId, data }) => updateUser(userId, data)))
  return results
}

export const deleteUser = (id: string): boolean => {
  console.log("(demo) deleteUser", id)
  return true
}

/* ------------------------------------------------------------------ */
/*  Extra helpers required by other pages                              */
/* ------------------------------------------------------------------ */

/** Return the user object that represents the current session. */
export const getCurrentUser = (): User | null => {
  // In a real app this would come from auth/session.
  // For the demo just return the first admin.
  return getDemoUsers().find((u) => u.role === "administrator") ?? null
}

/** True if the supplied (or current) user may view the Admin → Logs area. */
export const canViewLogs = (user: User | null | undefined = getCurrentUser()): boolean =>
  !!user && user.role === "administrator"

/** Demo-only “reset password” helper. Always succeeds and logs the action. */
export const resetUserPassword = async (id: string): Promise<boolean> => {
  const user = getUserById(id)
  if (!user) return false
  console.log(`(demo) reset password for user ${id}`)
  return true
}

/* ------------------------------------------------------------------ */
/*  Aggregate stats helpers                                            */
/* ------------------------------------------------------------------ */

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

/**
 * Bulk-update an array of users.
 *
 * In a real implementation you would make a single request to your backend
 * (or Batched Airtable update). To keep the demo self-contained we simply
 * log the change and echo the modified users back.
 */
export async function bulkUpdateUsers(users: (Partial<User> & { id: string })[]): Promise<User[]> {
  console.log("[bulkUpdateUsers] Requested updates for", users.length, "users")
  // TODO: Replace with real HTTP request.
  return users.map((u) => ({ ...u }) as User)
}
